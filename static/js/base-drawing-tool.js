/* static/js/base-drawing-tool.js */
/*
 * base-drawing-tool.js
 * Provides common functionality for drawing tools.
 * Maintains coin checking/charging and common helper methods.
 */
class BaseDrawingTool {
  constructor(toolName, cost) {
    this.toolName = toolName;
    this.cost = cost;
    // Each tool instance may manage its own state (firstPoint, preview, etc.)
    this.state = 0;
    this.firstPoint = null;
    this.preview = null;
    // Track if a drag occurred.
    this._mobileStartPoint = null;
    this._hasMoved = false;
  }

  canPlace() {
    return App.config.coins >= this.cost;
  }

  charge() {
    App.config.coins -= this.cost;
    App.updateCoinsDisplay();
  }

  static isValidDrag(startPoint, x, y, threshold = 5) {
    const dx = x - startPoint.x;
    const dy = y - startPoint.y;
    return Math.sqrt(dx * dx + dy * dy) >= threshold;
  }

  static showInsufficientFunds() {
    // Calls centralized unaffordable notification routine.
    window.notifyUnaffordable(100, 12);
  }

  // Helper: Compute common line metrics between a starting point and a current point.
  // Returns { dx, dy, midX, midY, angle, length }.
  static computeLineMetrics(startPoint, x, y) {
    const dx = x - startPoint.x;
    const dy = y - startPoint.y;
    const midX = (startPoint.x + x) / 2;
    const midY = (startPoint.y + y) / 2;
    const angle = Math.atan2(dy, dx);
    const length = Math.sqrt(dx * dx + dy * dy);
    return { dx, dy, midX, midY, angle, length };
  }

  // Helper: Remove a preview body from the world if it exists.
  static removePreview(preview) {
    if (preview && window.BallFall && window.BallFall.world) {
      Matter.World.remove(window.BallFall.world, preview);
    }
    return null;
  }

  // Generic mobile touch handling
  handleTouchStart(x, y, onStart) {
    this._mobileStartPoint = { x, y };
    this._hasMoved = false;
    if (onStart) onStart.call(this, x, y);
  }

  handleTouchMove(x, y, onMove) {
    this._hasMoved = true;
    if (onMove) onMove.call(this, x, y);
  }

  handleTouchEnd(x, y, onEnd, onCancel, cost) {
    // If there was no drag or the movement is too small, cancel.
    if (
      !this._hasMoved ||
      !BaseDrawingTool.isValidDrag(this._mobileStartPoint, x, y)
    ) {
      if (onCancel) onCancel.call(this);
      BaseDrawingTool.ignoreNextClick = true;
      return;
    }
    if (onEnd) onEnd.call(this, x, y);
    new BaseDrawingTool(this.toolName, cost).charge();
    this._hasMoved = false;
  }
}
// Flag used to ignore subsequent click events on mobile.
BaseDrawingTool.ignoreNextClick = false;
window.BaseDrawingTool = BaseDrawingTool;

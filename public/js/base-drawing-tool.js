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
  }

  canPlace() {
    return App.config.coins >= this.cost;
  }

  charge() {
    App.config.coins -= this.cost;
    App.updateCoinsDisplay();
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
}
window.BaseDrawingTool = BaseDrawingTool;

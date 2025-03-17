/* static/js/base-drawing-tool.js */
class BaseDrawingTool {
  constructor(toolName, cost) {
    this.toolName = toolName;
    this.cost = cost;
  }
  canPlace() {
    return App.config.coins >= this.cost;
  }
  charge() {
    App.config.coins -= this.cost;
    BaseDrawingTool.updateCoinsDisplay();
  }
  static updateCoinsDisplay() {
    const display = document.getElementById("coins-display");
    if (display) display.textContent = `${App.config.coins} coins`;
  }
  static showInsufficientFunds() {
    // Now calls the centralized unaffordable notification routine.
    window.notifyUnaffordable(100, 12);
  }
}
window.BaseDrawingTool = BaseDrawingTool;

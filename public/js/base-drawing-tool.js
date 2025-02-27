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
    const display = document.getElementById("coins-display");
    if (display) {
      const originalColor = "gold";
      const originalFontSize = window.getComputedStyle(display).fontSize;
      let count = 0;
      const flashInterval = setInterval(() => {
        count++;
        if (count % 2 === 0) {
          display.style.color = originalColor;
          display.style.fontSize = originalFontSize;
        } else {
          display.style.color = "red";
          display.style.fontSize = "20px";
        }
        if (count >= 12) {
          clearInterval(flashInterval);
          // Ensure final reset
          display.style.color = originalColor;
          display.style.fontSize = originalFontSize;
        }
      }, 100);
    }
  }
}
window.BaseDrawingTool = BaseDrawingTool;

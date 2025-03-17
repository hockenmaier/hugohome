/* static/js/drop-rate-controller.js
 *
 * This file restores the original drop rate behavior:
 * - The spawnInterval starts at the default 4480ms.
 * - Clicking the up arrow halves the spawnInterval (thus doubling the drop rate), but not below 100ms.
 * - Clicking the down arrow doubles the spawnInterval (halving the drop rate).
 * - When the auto-clicker is purchased, the drop rate indicator and arrows are revealed,
 *   and the drop rate display is updated immediately.
 */

document.addEventListener("DOMContentLoaded", function () {
  // Utility: update drop rate indicator text.
  function updateDropRateDisplay() {
    var dropRateValue = document.getElementById("bfui-drop-rate-value");
    if (!dropRateValue) return;
    // Use the current spawnInterval.
    var interval = window.BallFall.spawnInterval || App.config.spawnInterval;
    var bps = 1000 / interval;
    dropRateValue.textContent =
      bps < 1 ? "every " + (1 / bps).toFixed(1) + "s" : bps.toFixed(1) + "/s";
  }

  // Auto-clicker purchase event: show drop rate indicator and arrows, update display immediately.
  var autoBtn = document.getElementById("autoClicker");
  if (autoBtn) {
    autoBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (App.config.coins >= App.config.autoClickerCost) {
        App.config.coins -= App.config.autoClickerCost;
        App.config.autoClicker = true;
        autoBtn.style.display = "none";
        var dropIndicator = document.getElementById("spawner-indicator");
        var upArrow = document.getElementById("increaseSpeed");
        var downArrow = document.getElementById("decreaseSpeed");
        if (dropIndicator) dropIndicator.style.display = "flex";
        if (upArrow) upArrow.style.display = "inline";
        if (downArrow) downArrow.style.display = "inline";
        if (typeof BaseDrawingTool !== "undefined") {
          BaseDrawingTool.updateCoinsDisplay();
        }
        updateDropRateDisplay();
      } else {
        if (typeof BaseDrawingTool !== "undefined") {
          BaseDrawingTool.showInsufficientFunds();
        }
      }
    });
  }

  // Up arrow click: halve the spawnInterval (increase drop rate).
  var increaseBtn = document.getElementById("increaseSpeed");
  if (increaseBtn) {
    increaseBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var currentInterval = App.config.spawnInterval;
      var newInterval = currentInterval / 2;
      if (newInterval < 100) newInterval = 100; // Prevent too-fast spawning.
      window.BallFall.updateSpawnInterval(newInterval);
      updateDropRateDisplay();
    });
  }

  // Down arrow click: double the spawnInterval (decrease drop rate).
  var decreaseBtn = document.getElementById("decreaseSpeed");
  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var currentInterval = App.config.spawnInterval;
      var newInterval = currentInterval * 2;
      window.BallFall.updateSpawnInterval(newInterval);
      updateDropRateDisplay();
    });
  }

  // Also update the drop rate display once per second.
  setInterval(updateDropRateDisplay, 1000);
});

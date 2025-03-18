/*
 * spawner.js
 * Handles the clickable ball spawner and upgrade buttons.
 */
document.addEventListener("DOMContentLoaded", function () {
  let lastClickTime = 0;
  // Position the spawner container based on spawnX config.
  function positionSpawner() {
    const container = document.getElementById("spawner-container");
    if (!container) return;
    const xPos = window.innerWidth / App.config.spawnX + 5;
    container.style.left = xPos - container.offsetWidth / 2 + "px";
  }
  positionSpawner();
  window.addEventListener("resize", positionSpawner);

  const spawner = document.getElementById("ball-spawner");
  if (spawner) {
    spawner.addEventListener("click", function (e) {
      const now = Date.now();
      if (now - lastClickTime < App.config.spawnCooldown) return;
      lastClickTime = now;
      if (!App.simulationLoaded) {
        App.startSimulation();
      }
      window.BallFall.spawnBall();
    });
  } else {
    console.error("ball-spawner element not found");
  }

  // Auto-clicker upgrade.
  const autoClickerIcon = document.getElementById("autoClicker");
  if (autoClickerIcon) {
    autoClickerIcon.addEventListener("click", function (e) {
      if (App.config.autoClicker) return;
      if (App.config.coins >= App.config.autoClickerCost) {
        App.config.coins -= App.config.autoClickerCost;
        BaseDrawingTool.updateCoinsDisplay();
        App.config.autoClicker = true;
        var incBtn = document.getElementById("increaseSpeed");
        if (incBtn) {
          incBtn.style.display = "none";
        }
        var decBtn = document.getElementById("decreaseSpeed");
        if (decBtn) {
          decBtn.style.display = "none";
        }

        window.BallFall.startAutoSpawner();
      } else {
        flashElementStyle(
          document.getElementById("coins-display"),
          ["color", "fontSize"],
          { color: "red", fontSize: "20px" },
          100,
          6
        );
      }
    });
  }

  // Speed upgrade arrows.
  const increaseBtn = document.getElementById("increaseSpeed");
  const decreaseBtn = document.getElementById("decreaseSpeed");
  if (increaseBtn) {
    increaseBtn.addEventListener("click", function (e) {
      const currentLevel = App.config.maxUnlockedSpeedLevel;
      const nextCost = App.config.speedUpgradeCosts[currentLevel + 1];
      if (!nextCost) return;
      if (App.config.coins >= nextCost) {
        App.config.coins -= nextCost;
        BaseDrawingTool.updateCoinsDisplay();
        App.config.maxUnlockedSpeedLevel++;
        const newInterval =
          App.config.originalSpawnInterval /
          Math.pow(2, App.config.maxUnlockedSpeedLevel);
        App.config.spawnInterval = newInterval;
        window.BallFall.updateSpawnInterval(newInterval);
      } else {
        flashElementStyle(
          document.getElementById("coins-display"),
          ["color", "fontSize"],
          { color: "red", fontSize: "20px" },
          100,
          6
        );
      }
    });
  }
  if (decreaseBtn) {
    decreaseBtn.addEventListener("click", function (e) {
      const currentInterval = App.config.spawnInterval;
      const newInterval = currentInterval * 2;
      if (newInterval <= App.config.originalSpawnInterval) {
        App.config.spawnInterval = newInterval;
        window.BallFall.updateSpawnInterval(newInterval);
      }
    });
  }
});

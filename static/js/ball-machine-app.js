/*
 * ball-machine-app.js
 * Main app configuration and initialization.
 */
window.App = {
  config: {
    spawnInterval: 4480, // Default ball spawn interval in ms (auto-clicker rate)
    gravity: 0.75,
    timeScale: 0.82,
    restitution: 0.95,
    spawnX: 1.3, // x axis spawn point: 1/spawnX is the fraction of the screen width
    ballSize: 7,
    sitStillDeleteSeconds: 3,
    sitStillDeleteMargin: 1,
    disableDuration: 800, // milliseconds
    textHitColor: "#b3ffc7",
    lineThickness: 5,
    dottedLineHealth: 5,
    curvedLineFidelity: 30,
    lineDeleteMobileHold: 1200,
    launcherTypes: {
      launcher: {
        delay: 750,
        image: window.assetBase + "images/DKannon250.png",
        maxSpeed: 200,
      },
      "fast-launcher": {
        delay: 150,
        image: window.assetBase + "images/DKannon250-fast.png",
        maxSpeed: 350,
      },
      "insta-launcher": {
        delay: 10,
        image: window.assetBase + "images/DKannon250-insta.png",
        maxSpeed: 500,
      },
    },
    coins: 250, //Default for when app first loads and there's no storage
    costs: {
      straight: 5,
      curved: 20,
      launcher: 50,
      "fast-launcher": 200,
      "insta-launcher": 1000,
    },
    goalMinSpeed: 0.5,
    // New economy clicker settings:
    spawnCooldown: 250, // 0.25 sec cooldown between manual spawns
    autoClickerCost: 20, // Cost to unlock auto spawner
    speedUpgradeCosts: {
      1: 50,
      2: 100,
      3: 200,
      4: 400,
      5: 1600,
      6: 3200,
      7: 6400,
      8: 12800,
      9: 25600,
      10: 51200,
      11: 100000,
    },
    maxUnlockedSpeedLevel: 0, // Initially 0; increases with upgrades
    autoClicker: false, // Flag set when auto-clicker is purchased
    originalSpawnInterval: 4480, // To compute speed upgrades

    // --- New goal income settings ---
    goalDefaultIncome: 1, // Default coins earned when goal spawns at base position
    goalIncomeStepDesktop: 300, // Additional coin per 300px beyond base in desktop mode
    goalIncomeStepMobile: 500, // Additional coin per 500px beyond base in mobile mode
    goalBaseSpawnYDesktop: 300, // Base spawn Y for desktop mode (independent variable for income)
    goalBaseSpawnYMobile: 500, // Base spawn Y for mobile mode
    // New style settings for drawing tools:
    straightLineRender: {
      fillStyle: "#956eff",
      strokeStyle: "#956eff",
      lineWidth: 1,
    },
    straightLinePreviewRender: {
      fillStyle: "rgba(149,110,255,0.5)",
      strokeStyle: "rgba(149,110,255,0.5)",
      lineWidth: 1,
    },
    curvedLineRender: {
      fillStyle: "#956eff",
      strokeStyle: "#956eff",
      lineWidth: 1,
    },
    curvedLinePreviewRender: {
      fillStyle: "rgba(149,110,255,0.5)",
      strokeStyle: "rgba(149,110,255,0.5)",
      lineWidth: 1,
    },
    dottedLineRender: {
      visible: false,
      fillStyle: "transparent",
      strokeStyle: "#a8328d",
      lineWidth: 5,
    },
    dottedLinePreviewRender: {
      visible: true,
      fillStyle: "transparent",
      strokeStyle: "#a8328d",
      lineWidth: 2,
      lineDash: [],
    },
    launcherPreviewRender: {
      fillStyle: "rgba(149,110,255,0.5)",
      strokeStyle: "rgba(149,110,255,0.5)",
      lineWidth: 1,
    },
  },
  modules: {},
  simulationLoaded: false, // Tracks whether the physics simulation is running

  // startSimulation loads Matter.js, text colliders, etc.
  // In static/js/ball-machine-app.js
  // In static/js/ball-machine-app.js
  startSimulation: function () {
    if (window.App.simulationLoaded) return;
    window.App.simulationLoaded = true;
    // Initialize simulation modules – preserving existing comments.
    if (window.App.modules.base) window.App.modules.base.init();
    if (window.App.modules.text) window.App.modules.text.init();
    if (window.App.modules.lines) window.App.modules.lines.init();
    if (window.App.modules.launcher) window.App.modules.launcher.init();

    // Load auto-clicker state for this page from persistent storage.
    if (
      App.Persistence &&
      typeof App.Persistence.loadAutoClicker === "function"
    ) {
      var autoData = App.Persistence.loadAutoClicker();
      if (autoData && autoData.purchased) {
        App.config.autoClicker = true;
        App.config.maxUnlockedSpeedLevel = autoData.maxSpeedLevel;
        var newInterval =
          App.config.originalSpawnInterval /
          Math.pow(2, autoData.maxSpeedLevel);
        App.config.spawnInterval = newInterval;
        window.BallFall.updateSpawnInterval(newInterval);
        window.BallFall.startAutoSpawner();
        // Update the cost display so it reflects the proper next upgrade cost.
        if (App.updateAutoClickerCostDisplay) {
          App.updateAutoClickerCostDisplay();
        }
      }
    }

    // Show the game UI (it is hidden by default in the HTML)
    const ui = document.getElementById("ballfall-ui");
    if (ui) ui.style.display = "block";

    // Show auto clicker upgrade button and its cost only after simulation loads.
    const autoClickerBtn = document.getElementById("autoClicker");
    if (autoClickerBtn) {
      autoClickerBtn.style.display = "block";
      const autoClickerCost = document.getElementById("autoClickerCost");
      if (autoClickerCost) autoClickerCost.style.display = "block";
    }

    window.addEventListener("scroll", function updateCamera() {
      if (window.BallFall && window.BallFall.render) {
        Matter.Render.lookAt(window.BallFall.render, {
          min: { x: window.scrollX, y: window.scrollY },
          max: {
            x: window.scrollX + window.innerWidth,
            y: window.scrollY + window.innerHeight,
          },
        });
      }
    });
  },

  init: function () {
    // No auto-init; simulation is started via user click on spawner.
  },
};

function initApp() {
  App.init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

// --- Begin persistent storage module and update functions ---
if (window.localStorage) {
  // Initialize persistent coins using our new storage module
  // If a saved value exists, load it; otherwise, save the default value.
  App.Storage = {
    namespace: "game",
    getKey: function (itemName) {
      return this.namespace + "." + itemName;
    },
    getItem: function (itemName, defaultValue) {
      var key = this.getKey(itemName);
      var val = localStorage.getItem(key);
      return val !== null ? JSON.parse(val) : defaultValue;
    },
    setItem: function (itemName, value) {
      var key = this.getKey(itemName);
      localStorage.setItem(key, JSON.stringify(value));
    },
  };

  // Load coins from persistent storage or use default
  App.config.coins = App.Storage.getItem("coins", App.config.coins);
}

App.updateCoinsDisplay = function () {
  const display = document.getElementById("coins-display");
  if (display) display.textContent = `${App.config.coins} coins`;
  if (App.Storage) {
    App.Storage.setItem("coins", App.config.coins);
    //App.Storage.setItem("coins", 2000); //Use for adding coins to storage
  }
};
// --- End persistent storage module and update functions ---

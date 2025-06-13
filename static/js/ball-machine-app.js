/*
 * ball-machine-app.js
 * Main app configuration and initialization.
 */

// Wake Lock integration: keep the screen awake while the simulation is running.
let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
      console.log("Wake Lock was released");
      wakeLock = null; // Reset variable so it can be re-requested.
    });
    console.log("Wake Lock is active");
  } catch (err) {
    console.error(`${err.name}, ${err.message}`);
  }
}

// This is where to keep all of the app's Global variables

window.App = {
  config: {
    spawnInterval: 4480, // Default ball spawn interval in ms (auto-clicker rate)
    gravity: 0.75,
    timeScale: 0.82,
    restitution: 0.95, // This is set on balls, but essentially doesn't matter due to the patchRestitution override in base-simulation.js
    spawnX: window.innerWidth < 620 ? 1.4 : 1.4, // mobile, desktop uses 1.4
    ballSize: 7,
    sitStillDeleteSeconds: 2,
    sitStillDeleteMargin: 0.5,
    disableDuration: 600, // milliseconds
    //textHitFadeTime: 100, //seconds  //Not yet used
    lineThickness: 5,
    dottedLineHealth: 50,
    curvedLineFidelity: 30,
    lineDeleteMobileHold: 1200,
    refundRate: 0.5, // 50 % of original cost is returned on delete
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
    /* --- Gear settings ---------------------------------------------------- */
    gearRotationDuration: 30000, // ← one rev every 30s, about 1 ball/s (same as compactor)
    gearTypes: {
      // meta for future use
      "gear-cw": { dir: 1, image: window.assetBase + "images/gear-30.png" },
      "gear-ccw": { dir: -1, image: window.assetBase + "images/gear-30.png" },
    },
    gearSizeMultiplier: 4.5,

    coins: 111, //Starting coins for when app first loads and there's nothing in storage
    costs: {
      straight: 5,
      curved: 50,
      launcher: 2000,
      "fast-launcher": 10000,
      "insta-launcher": 50000,
      "gear-cw": 300,
      "gear-ccw": 300,
      "bubble-wand": 5000000,
    },
    goalMinSpeed: 0.5, //Speed balls must be traveling to trigger the goal

    // Economy clicker settings:
    spawnCooldown: 250, // 0.25 sec cooldown between manual spawns
    autoClickerCost: 200, // Cost to unlock auto spawner
    speedUpgradeCosts: {
      // 1: every 2.2, 2: 1.1, 3: 1.8/s, 4: 3.6/s
      1: 1000,
      2: 5000,
      3: 30000,
      4: 100000,
      5: 250000,
      6: 1000000,
      7: 2000000,
      8: 4000000,
      9: 8000000,
      10: 16000000,
      11: 32000000,
      12: 64000000,
    },
    maxUnlockedSpeedLevel: 0, // Initially 0; increases with upgrades
    autoClicker: false, // Flag set when auto-clicker is purchased
    originalSpawnInterval: 4480, // To compute speed upgrades

    // --- Goal income settings ---
    // goalDefaultIncome: 0, // Default coins earned when goal spawns at base position - set to zero for now; only ball-based income will be used with this set to 0
    // goalIncomeStepDesktop: 3000000, // Additional coin per 300px beyond base in desktop mode, currently set very high to essentially not use depth-based rewards, but should be maintained.
    // goalIncomeStepMobile: 5000000, // Additional coin per 500px beyond base in mobile mode, currently set very high to essentially not use depth-based rewards, but should be maintained.

    // --- Goal min depth settings ---
    goalBaseSpawnYDesktop: 300, // Base spawn Y for desktop mode (independent variable for income)
    goalBaseSpawnYMobile: 500, // Base spawn Y for mobile mode

    // --- Rube Goldberg Time-based income settings ---
    ballStartValue: 1, //The value of a ball when it spawns
    ballIncomeIncrement: 1,
    ballIncomeTimeStep: 2000, // Every ballIncomeTimeStep ms, the ball will gain ballIncomeIncrement in value

    // Configurable ball color thresholds.
    // The ball’s color will be interpolated between these thresholds:
    // 0: white, 3: #ffa200, 10: #26ff00, 25: #000dff, 100: #ff00ff, 500+: #ff0000.
    ballColorThresholds: [
      { value: 0, color: "#ffffff" }, //original white
      { value: 5, color: "#fffae6" }, //yellower
      { value: 10, color: "#fff3c7" }, //white-yellow
      { value: 15, color: "#fcdf77" }, //yellower
      { value: 20, color: "#ffd12e" }, //almost orange-yellow
      { value: 25, color: "#ffc600" }, //orange-yellow
      { value: 100, color: "#26ff00" }, //green
      { value: 500, color: "#000dff" }, //blue
      { value: 5000, color: "#ff00ff" }, //purple
      { value: 50000, color: "#ff0000" }, //red
      { value: 1000000, color: "#000000" }, //black
    ],

    // --- New Revenue Tracking ---
    revenueRate: 0, // This page coins/s (recurring revenue), updated by game.js

    // Style settings for drawing tools:
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
      fillStyle: "#4b54b8",
      strokeStyle: "#4b54b8",
      lineWidth: 1,
    },
    curvedLinePreviewRender: {
      fillStyle: "rgba(75, 84, 184,0.5)",
      strokeStyle: "rgba(75, 84, 184,0.5)",
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
      fillStyle: "rgba(149,110,255,1)",
      strokeStyle: "rgba(149,110,255,1)",
      lineWidth: 1,
    },

    // Compactor globals.
    compactor: {
      cost: 1000000,
      naturalDimensions: {
        left: { width: 475, height: 811 },
        middle: { width: 470, height: 811 },
        right: { width: 475, height: 811 },
      },
      // Overall target width is ballSize multiplied by this factor.
      targetWidthMultiplier: 15,
      closedInset: 15, // positive number to offset closed positions (set to 0 if you want edges to meet exactly)

      timeline: {
        //Overall timeline is 1 per second, same as gear
        idleDuration: 0.57, // seconds to idle
        crushDuration: 0.12, // seconds to crush (close)
        shakeDuration: 0.06, // seconds per shake
        shakeRepeat: 3, // number of shake repeats (yoyo)
        openDuration: 0.25, // seconds to open
      },
    },
    /* Bubble-Wand tunables */
    bubbleWand: {
      diameterMultiplier: 6, // sprite size relative to ball
      sensorRadiusMultiplier: 1.5, // sensor size relative to ball
      bubbleCooldownMs: 11000,
    },
  },
  modules: {},
  simulationLoaded: false, // Tracks whether the physics simulation is running

  // startSimulation loads Matter.js, text colliders, etc.
  // In static/js/ball-machine-app.js
  startSimulation: function () {
    if (window.App.simulationLoaded) return;
    // record the exact moment the game actually starts
    window.gameStartTime = Date.now();
    window.App.simulationLoaded = true;

    // Initialize simulation modules – preserving existing comments.
    if (window.App.modules.base) window.App.modules.base.init();
    if (window.App.modules.text) window.App.modules.text.init();
    if (window.App.modules.lines) window.App.modules.lines.init();
    if (window.App.modules.launcher) window.App.modules.launcher.init();

    // [Wake Lock] Request wake lock when simulation starts.
    requestWakeLock();
    // Re-request wake lock when page becomes visible if simulation is running.
    document.addEventListener("visibilitychange", () => {
      if (
        document.visibilityState === "visible" &&
        window.App.simulationLoaded &&
        !wakeLock
      ) {
        requestWakeLock();
      }
    });

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
  formatCostLabels();
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

// Helper: format numbers with commas and M/B/T suffixes
App.formatNumber = function (val) {
  val = Math.floor(val);
  if (val >= 1e12) return (val / 1e12).toFixed(3) + "T";
  if (val >= 1e9) return (val / 1e9).toFixed(3) + "B";
  if (val >= 1e6) return (val / 1e6).toFixed(3) + "M";
  return val.toLocaleString("en-US");
};

function formatCostLabels() {
  document.querySelectorAll(".cost-label:not(.no-format)").forEach((el) => {
    const m = el.textContent.replace(/[^0-9]/g, "");
    const num = parseInt(m, 10);
    if (!isNaN(num)) {
      el.innerHTML = '<img src="' + coinCostURL + '" alt="Coin" /> ' +
        App.formatNumber(num);
    }
  });
}

App.updateCoinsDisplay = function () {
  const prev = App.__prevCoins || App.config.coins;
  const delta = App.config.coins - prev;
  App.__prevCoins = App.config.coins;
  if (App.Achievements && typeof App.Achievements.onCoinsChange === "function") {
    App.Achievements.onCoinsChange(delta);
  }
  const formatted = App.formatNumber(App.config.coins);
  const display = document.getElementById("coins-display");
  if (display) display.textContent = `${formatted} coins`;
  const globalDisplay = document.getElementById("global-coins-display");
  if (globalDisplay) globalDisplay.textContent = `${formatted} coins`;
  if (App.Storage) {
    App.Storage.setItem("coins", App.config.coins);
  }
  // ---------- Evaluate upgrade progression ----------
  if (App.PowerUps && typeof App.PowerUps.checkUnlocks === "function") {
    App.PowerUps.checkUnlocks(App.config.coins);
  }
};

window.addEventListener("beforeunload", () => {
  const duration = Math.round((Date.now() - window.gameStartTime) / 1000);
  const totalCoins = App.config.coins;
  // this page’s saved rev/sec
  const pageRate = App.Persistence.loadRecurringRevenue() || 0;
  // total rev/sec across all pages
  let totalRate = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("game.") && key.endsWith(".revenue")) {
      totalRate += Number(localStorage.getItem(key)) || 0;
    }
  }

  gtag("event", "game_session_summary", {
    event_category: "Ball Machine",
    session_duration_sec: duration,
    total_coins: totalCoins,
    page_revenue_rate: pageRate,
    total_revenue_rate: totalRate,
    transport_type: "beacon",
  });
});

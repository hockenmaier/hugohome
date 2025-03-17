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
    spawnX: 1.5, // x axis spawn point: 1/spawnX is the fraction of the screen width
    spawnManual: 7, // Position for manual click-to-spawn, similar rules to auto-spawner
    ballSize: 7,
    sitStillDeleteSeconds: 3,
    sitStillDeleteMargin: 1,
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
    coins: 5000,
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
    speedUpgradeCosts: { 1: 50, 2: 100, 3: 200 }, // Upgrades: x2, x4, x8, etc.
    maxUnlockedSpeedLevel: 0, // Initially 0; increases with upgrades
    autoClicker: false, // Flag set when auto-clicker is purchased
    originalSpawnInterval: 4480, // To compute speed upgrades
  },
  modules: {},
  simulationLoaded: false, // Tracks whether the physics simulation is running

  // startSimulation loads Matter.js, text colliders, etc.
  startSimulation: function () {
    if (window.App.simulationLoaded) return;
    window.App.simulationLoaded = true;
    // Initialize simulation modules – preserving existing comments.
    if (window.App.modules.base) window.App.modules.base.init();
    if (window.App.modules.text) window.App.modules.text.init();
    if (window.App.modules.lines) window.App.modules.lines.init();
    if (window.App.modules.launcher) window.App.modules.launcher.init();
    // Show the game UI (it is hidden by default in the HTML)
    const ui = document.getElementById("ballfall-ui");
    if (ui) ui.style.display = "block";
    // After sim starts, if auto-clicker upgrade is not purchased, show its button.
    if (!App.config.autoClicker) {
      var autoBtn = document.getElementById("autoClicker");
      if (autoBtn) autoBtn.style.display = "inline";
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

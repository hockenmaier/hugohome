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
    coins: 25, //Default for when app first loads and there's no storage
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
    }, // Upgrades: x2, x4, x8, etc.
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
    // Removed duplicate ball spawn here.
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

    // Load persisted objects so placed items appear in their saved positions.
    if (App.Storage && typeof App.loadPlacedObjects === "function") {
      App.loadPlacedObjects();
    }
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

// --- Begin persistent object storage module ---
// These methods save/load placed objects (lines, goals, etc.) per page using localStorage.
// Objects are gathered from the physics world based on a persistent flag (or known labels).
App.savePlacedObjects = function () {
  var objects = [];
  if (window.BallFall && window.BallFall.world) {
    var bodies = Matter.Composite.allBodies(window.BallFall.world);
    bodies.forEach(function (body) {
      // Check for persistent objects by flag or by known user-placed labels.
      if (
        body.isPersistent ||
        body.isLine ||
        ["Goal", "Launcher", "DottedLine", "CurvedLine"].includes(body.label)
      ) {
        var obj = {
          label: body.label,
          position: { x: body.position.x, y: body.position.y },
          angle: body.angle,
        };
        if (body.bounds) {
          obj.bounds = {
            min: { x: body.bounds.min.x, y: body.bounds.min.y },
            max: { x: body.bounds.max.x, y: body.bounds.max.y },
          };
        }
        if (body.circleRadius) {
          obj.circleRadius = body.circleRadius;
        }
        if (body.health !== undefined) {
          obj.health = body.health;
        }
        objects.push(obj);
      }
    });
  }
  App.Storage.setItem("pageObjects_" + window.location.pathname, objects);
};

App.loadPlacedObjects = function () {
  var objects = App.Storage.getItem(
    "pageObjects_" + window.location.pathname,
    null
  );
  if (!objects) return;
  // Remove any existing persistent objects from the world
  if (window.BallFall && window.BallFall.world) {
    var bodies = Matter.Composite.allBodies(window.BallFall.world);
    bodies.forEach(function (body) {
      if (
        body.isPersistent ||
        body.isLine ||
        ["Goal", "Launcher", "DottedLine", "CurvedLine"].includes(body.label)
      ) {
        Matter.World.remove(window.BallFall.world, body);
      }
    });
  }
  // Recreate objects from saved data
  objects.forEach(function (obj) {
    var newBody;
    if (obj.label === "Goal") {
      newBody = Matter.Bodies.circle(
        obj.position.x,
        obj.position.y,
        obj.circleRadius || 20,
        {
          isStatic: true,
          isSensor: true,
          label: "Goal",
          render: {
            sprite: {
              texture: goalTexture,
              xScale: ((obj.circleRadius || 20) * 2) / 100,
              yScale: ((obj.circleRadius || 20) * 2) / 100,
            },
            visible: true,
          },
        }
      );
    } else {
      // For lines and similar objects, use rectangle.
      var width = 0,
        height = 0;
      if (obj.bounds) {
        width = obj.bounds.max.x - obj.bounds.min.x;
        height = obj.bounds.max.y - obj.bounds.min.y;
      }
      newBody = Matter.Bodies.rectangle(
        obj.position.x,
        obj.position.y,
        width || 100,
        height || App.config.lineThickness,
        {
          isStatic: true,
          angle: obj.angle,
          label: obj.label,
          render: {
            fillStyle: obj.label === "DottedLine" ? "#a8328d" : "#956eff",
            strokeStyle: obj.label === "DottedLine" ? "#a8328d" : "#956eff",
            lineWidth: 1,
          },
        }
      );
      if (obj.health !== undefined) {
        newBody.health = obj.health;
      }
    }
    newBody.isPersistent = true;
    Matter.World.add(window.BallFall.world, newBody);
  });
};
// --- End persistent object storage module ---

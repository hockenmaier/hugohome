(function () {
  // Create a unique key based on the current page path
  function getStorageKey() {
    return "hugohome_state_" + window.location.pathname;
  }

  // Save game state to localStorage
  function saveGameState() {
    const state = {};
    // Save coins count
    state.coins = App.config.coins;

    // Save persistent bodies (only our drawn objects, launchers, and goal)
    const bodies = Matter.Composite.allBodies(window.BallFall.world);
    state.bodies = bodies
      .filter((b) => b.isPersistent)
      .map((b) => {
        const data = {
          label: b.label,
          position: { x: b.position.x, y: b.position.y },
          angle: b.angle,
        };
        // Save extra info based on type
        if (b.isLine) {
          data.type = "line";
          // Estimate length from bounds
          data.width = b.bounds.max.x - b.bounds.min.x;
        } else if (b.label === "Launcher") {
          data.type = "launcher";
          data.launchForce = b.launchForce;
          data.delay = b.delay;
        } else if (b.label === "Goal") {
          data.type = "goal";
          data.radius = b.circleRadius;
        } else {
          data.type = b.label;
        }
        return data;
      });
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
  }

  // Load game state from localStorage
  function loadGameState() {
    const stored = localStorage.getItem(getStorageKey());
    if (!stored) return;
    const state = JSON.parse(stored);
    // Restore coin count
    if (typeof state.coins === "number") {
      App.config.coins = state.coins;
      const coinEl = document.getElementById("coins-display");
      if (coinEl) coinEl.textContent = App.config.coins + " coins";
    }
    // Restore persistent bodies
    if (Array.isArray(state.bodies)) {
      const World = Matter.World;
      const Bodies = Matter.Bodies;
      state.bodies.forEach((data) => {
        let body;
        if (data.type === "line") {
          body = Bodies.rectangle(
            data.position.x,
            data.position.y,
            data.width,
            App.config.lineThickness,
            {
              isStatic: true,
              angle: data.angle,
              render: {
                fillStyle: "#956eff",
                strokeStyle: "#956eff",
                lineWidth: 1,
              },
            }
          );
          body.isLine = true;
          body.isPersistent = true;
        } else if (data.type === "launcher") {
          const size = 40;
          body = Bodies.rectangle(
            data.position.x,
            data.position.y,
            size,
            size,
            {
              isStatic: true,
              isSensor: true,
              label: "Launcher",
              render: {
                sprite: {
                  texture: App.config.launcherTypes["launcher"].image,
                  xScale: size / 250,
                  yScale: size / 250,
                },
                opacity: 1,
              },
            }
          );
          body.launchForce = data.launchForce;
          body.delay = data.delay;
          body.isPersistent = true;
        } else if (data.type === "goal") {
          body = Bodies.circle(data.position.x, data.position.y, data.radius, {
            isStatic: true,
            isSensor: true,
            label: "Goal",
            render: {
              sprite: {
                texture: goalTexture, // defined in baseof.html
                xScale: (data.radius * 2) / 100,
                yScale: (data.radius * 2) / 100,
              },
              visible: true,
            },
          });
          body.isPersistent = true;
          if (
            App.modules.goal &&
            typeof App.modules.goal.attach === "function"
          ) {
            App.modules.goal.attach(body);
          }
        }
        if (body) {
          World.add(window.BallFall.world, body);
        }
      });
    }
  }

  // Auto-save every 5 seconds
  setInterval(saveGameState, 5000);
  // Also save on page unload
  window.addEventListener("beforeunload", saveGameState);

  // Expose if needed
  window.GamePersistence = {
    save: saveGameState,
    load: loadGameState,
  };

  // When the BallFall world is ready, load state
  if (window.BallFall && window.BallFall.world) {
    loadGameState();
  } else {
    window.addEventListener("BallFallBaseReady", loadGameState);
  }
})();

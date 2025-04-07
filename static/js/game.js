(function () {
  let goalSpawned = false;

  function spawnGoal() {
    // Use the per-page persistence functions.
    const savedGoal = App.Persistence.loadGoal();
    if (savedGoal) {
      // A saved goal exists—rebuild it.
      App.Persistence.rebuildGoal();
      goalSpawned = true;
      return;
    }
    if (goalSpawned) return;

    const Bodies = Matter.Bodies,
      World = Matter.World,
      Composite = Matter.Composite,
      world = window.BallFall.world,
      goalWidth = 40,
      goalHeight = 40;

    let pageWidth, pageHeight, minY;
    if (window.innerWidth < 720) {
      pageWidth = window.innerWidth;
      pageHeight = window.innerHeight;
      minY = App.config.goalBaseSpawnYMobile + goalHeight / 2;
    } else {
      pageWidth = document.body.scrollWidth;
      pageHeight = document.body.scrollHeight;
      minY = App.config.goalBaseSpawnYDesktop + goalHeight / 2;
    }
    const maxX = pageWidth - goalWidth / 2,
      maxY = pageHeight - goalHeight / 2,
      maxAttempts = 100;
    let attempt = 0,
      candidate;

    do {
      const x = Math.random() * (maxX - goalWidth / 2) + goalWidth / 2;
      const y = Math.random() * (maxY - minY) + minY;
      candidate = Bodies.circle(x, y, goalWidth / 2, {
        isStatic: true,
        isSensor: true,
        label: "Goal",
        render: {
          sprite: {
            texture: goalTexture,
            xScale: goalWidth / 100,
            yScale: goalHeight / 100,
          },
          visible: true,
        },
      });
      Matter.Body.setPosition(candidate, { x: x, y: y });
      Matter.Body.update(candidate, 0, 0, 0);

      let collides = false;
      const bodies = Composite.allBodies(world);
      for (let b of bodies) {
        if (b === candidate) continue;
        if (b.isStatic && b.label !== "BallFallBall" && b.label !== "Goal") {
          if (b.elRef && b.elRef.tagName === "SPAN") {
            if (Matter.Bounds.overlaps(candidate.bounds, b.bounds)) {
              collides = true;
              break;
            }
          } else {
            const collision = Matter.SAT.collides(candidate, b);
            if (collision && collision.collided) {
              collides = true;
              break;
            }
          }
        }
      }
      if (!collides) break;
      attempt++;
    } while (attempt < maxAttempts);

    World.add(world, candidate);
    if (App.modules.goal && typeof App.modules.goal.attach === "function") {
      App.modules.goal.attach(candidate);
    }
    // Save the new goal data using per‑page keys.
    App.Persistence.saveGoal({
      x: candidate.position.x,
      y: candidate.position.y,
      goalWidth: goalWidth,
      goalHeight: goalHeight,
    });
    goalSpawned = true;
  }

  // Waits for text colliders—but on mobile text colliders aren’t built, so call callback immediately.
  function waitForTextColliders(callback) {
    if (window.innerWidth < 720) {
      callback();
      return;
    }
    const Composite = Matter.Composite,
      world = window.BallFall.world;
    const bodies = Composite.allBodies(world);
    const hasTextColliders = bodies.some(
      (b) => b.elRef && b.elRef.tagName === "SPAN"
    );
    if (hasTextColliders) {
      callback();
    } else {
      setTimeout(() => waitForTextColliders(callback), 100);
    }
  }

  function initSpawn() {
    if (window.BallFall && window.BallFall.engine) {
      waitForTextColliders(spawnGoal);
    } else {
      window.addEventListener("BallFallBaseReady", function () {
        waitForTextColliders(spawnGoal);
      });
    }
  }

  initSpawn();
})();

// --- Begin Moving Average Coin Revenue Calculation ---
// This block calculates coin revenue per second as a moving average over the last 25 seconds,
// ignoring any negative deltas (e.g. purchases).
// It updates the UI element with id "revenue-display" once per second.
(function () {
  let lastCoinCount = App.config.coins;
  const history = [];
  const maxHistory = 25;

  function updateRevenue() {
    const currentCoins = App.config.coins;
    let delta = currentCoins - lastCoinCount;
    if (delta < 0) delta = 0;
    history.push(delta);
    if (history.length > maxHistory) history.shift();

    const sum = history.reduce((a, b) => a + b, 0);
    const avgRevenue = sum / history.length;

    //console.log(`Delta: ${delta}, Average: ${avgRevenue.toFixed(1)}`); // debug log

    const revenueDisplay = document.getElementById("revenue-display");
    if (revenueDisplay) {
      revenueDisplay.innerHTML = `<img src="${coinCostURL}" alt="Coin" style="width:12px; height:12px;"> ${avgRevenue.toFixed(
        1
      )} /s`;
    }

    lastCoinCount = currentCoins;
  }

  // Wait until BallFall and the revenue-display element exist.
  function start() {
    if (!window.BallFall || !document.getElementById("revenue-display")) {
      setTimeout(start, 250);
      return;
    }
    setInterval(updateRevenue, 1000);
  }

  start();
})();

// game.js: Handles goal spawning and cross‑page revenue updates.
(function () {
  let goalSpawned = false;

  function spawnGoal() {
    // Use the per‑page persistence functions.
    const savedGoal = App.Persistence.loadGoal();
    if (savedGoal) {
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

// --- Begin Modified Moving Average Revenue Calculation ---
// Now calculates "This page coins/s" excluding coins added from "Other pages" revenue.
(function () {
  let lastCoinCount = App.config.coins;
  const history = [];
  const maxHistory = 25;
  let currentPageRate = 0; // Computed moving average for this page

  // Sum recurring revenue for all pages from storage.
  function getAllPagesRevenue() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("game.") && key.endsWith(".revenue")) {
        try {
          const rate = JSON.parse(localStorage.getItem(key));
          total += Number(rate) || 0;
        } catch (e) {
          // ignore parsing errors
        }
      }
    }
    return total;
  }
  // Other pages revenue is all pages' minus this page's value.
  function getOtherPagesRevenue() {
    return getAllPagesRevenue() - currentPageRate;
  }

  function updateRevenue() {
    const currentCoins = App.config.coins;
    let rawDelta = currentCoins - lastCoinCount;
    // Remove other pages contribution from the delta
    let otherRate = getOtherPagesRevenue();
    let delta = rawDelta - otherRate;
    if (delta < 0) {
      delta = history.length > 0 ? history[history.length - 1] : 0;
    }
    history.push(delta);
    if (history.length > maxHistory) history.shift();
    currentPageRate = Math.round(
      history.reduce((a, b) => a + b, 0) / history.length
    );

    // Update display for this page coins/s.
    const thisDisplay = document.getElementById("thispage-revenue-display");
    if (thisDisplay) {
      thisDisplay.innerHTML =
        '<img src="' +
        coinCostURL +
        '" alt="Coin" style="width:12px;height:12px;"> ' +
        currentPageRate +
        " /s";
    }
    // Save only if auto‑clicker purchased.
    if (App.config.autoClicker) {
      App.Persistence.saveRecurringRevenue(currentPageRate);
    }
    lastCoinCount = currentCoins;
  }

  function addOtherPagesRevenue() {
    let otherRate = getOtherPagesRevenue();
    App.config.coins += otherRate;
    App.updateCoinsDisplay();
    const otherDisplay = document.getElementById("otherpages-revenue-display");
    if (otherDisplay) {
      otherDisplay.innerHTML =
        '<img src="' +
        coinCostURL +
        '" alt="Coin" style="width:12px;height:12px;"> ' +
        otherRate +
        " /s";
    }
  }

  // Update coin info container visibility.
  // It stays hidden only if no recurring revenue exists anywhere.
  // Once the simulation has started or any page records coins/s, it shows.
  function updateCoinInfoVisibility() {
    const coinInfo = document.getElementById("coin-info");
    if (!coinInfo) return;
    const simRunning = window.App.simulationLoaded;
    const anyRevenue = getAllPagesRevenue() > 0;
    coinInfo.style.display = simRunning || anyRevenue ? "inline-block" : "none";
  }

  function startRevenueUpdates() {
    if (
      !window.BallFall ||
      !document.getElementById("thispage-revenue-display")
    ) {
      setTimeout(startRevenueUpdates, 250);
      return;
    }
    setInterval(updateRevenue, 1000);
    setInterval(addOtherPagesRevenue, 1000);
    setInterval(updateCoinInfoVisibility, 1000);
  }
  startRevenueUpdates();
})();

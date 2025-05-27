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
    if (window.innerWidth < 620) {
      pageWidth = window.innerWidth;
      pageHeight = pageHeight = document.body.scrollHeight; //We used to make this innerHeight so goals were always visible on phone mode but F that mobile users can figure it out.. it's more fun this way
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
    if (window.innerWidth < 620) {
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
(function () {
  const history = [];
  const maxHistory = 60;
  let currentPageRate = 0; // This page’s moving average
  // Accumulates this second's auto-clicker income
  App.autoIncomeThisSecond = 0;

  // Sum all stored recurring revenue from all pages.
  function getAllPagesRevenue() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("game.") && key.endsWith(".revenue")) {
        try {
          const rate = JSON.parse(localStorage.getItem(key));
          total += Number(rate) || 0;
        } catch (e) {}
      }
    }
    return total;
  }
  // Only subtract this page’s rate if autoClicker is purchased; otherwise, treat this page rate as 0.
  function getOtherPagesRevenue() {
    const cp = App.config.autoClicker ? currentPageRate : 0;
    return getAllPagesRevenue() - cp;
  }

  function updateRevenue() {
    // 1) record this second’s auto-clicker income
    const thisRate = App.autoIncomeThisSecond || 0;

    // 2) push into history and trim to maxHistory
    history.push(thisRate);
    if (history.length > maxHistory) history.shift();

    // 3) recompute moving average
    currentPageRate = Math.round(
      history.reduce((sum, v) => sum + v, 0) / history.length
    );

    // 4) update the on-page display
    const thisDisplay = document.getElementById("thispage-revenue-display");
    if (thisDisplay) {
      thisDisplay.innerHTML = window.App.simulationLoaded
        ? 'This page: <img src="' +
          coinCostURL +
          '" alt="Coin" style="width:12px;height:12px;"> ' +
          currentPageRate +
          " /s"
        : "";
    }

    // 5) persist if auto-clicker’s active
    if (App.config.autoClicker) {
      App.Persistence.saveRecurringRevenue(currentPageRate);
    }

    // 6) reset for next interval
    App.autoIncomeThisSecond = 0;
  }

  function addOtherPagesRevenue() {
    let otherRate = getOtherPagesRevenue();
    App.config.coins += otherRate;
    App.updateCoinsDisplay();
    const otherDisplay = document.getElementById("otherpages-revenue-display");
    if (otherDisplay) {
      // If simulation hasn’t started, remove the "Other pages:" label,
      // otherwise use the full label.
      if (!window.App.simulationLoaded) {
        otherDisplay.innerHTML =
          '<img src="' +
          coinCostURL +
          '" alt="Coin" style="width:12px;height:12px;"> ' +
          otherRate +
          " /s";
      } else {
        otherDisplay.innerHTML =
          "Other pages: " +
          '<img src="' +
          coinCostURL +
          '" alt="Coin" style="width:12px;height:12px;"> ' +
          otherRate +
          " /s";
      }
    }
  }

  // Show coin info if sim has started or if any recurring revenue exists across pages.
  function updateCoinInfoVisibility() {
    const coinInfo = document.getElementById("coin-info");
    if (!coinInfo) return;
    const simRunning = window.App.simulationLoaded;
    const anyRevenue = getAllPagesRevenue() > 0;
    coinInfo.style.display = simRunning || anyRevenue ? "inline-block" : "none";
  }

  function startRevenueUpdates() {
    if (!document.getElementById("thispage-revenue-display")) {
      setTimeout(startRevenueUpdates, 250);
      return;
    }
    // On load, if a recurring rate was saved for this page, update displays.
    let savedRate = App.Persistence.loadRecurringRevenue();
    if (savedRate !== null) {
      currentPageRate = Number(savedRate);
      const thisDisplay = document.getElementById("thispage-revenue-display");
      if (thisDisplay) {
        thisDisplay.innerHTML =
          '<img src="' +
          coinCostURL +
          '" alt="Coin" style="width:12px;height:12px;"> ' +
          currentPageRate +
          " /s";
      }
    }
    App.updateCoinsDisplay();
    setInterval(updateRevenue, 1000);
    setInterval(addOtherPagesRevenue, 1000);
    setInterval(updateCoinInfoVisibility, 1000);
  }
  startRevenueUpdates();
})();

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

    let pageWidth, pageHeight, minY, maxX, maxY;
    if (window.innerWidth < 620) {
      pageWidth = window.innerWidth;
      pageHeight = document.body.scrollHeight;
      minY = App.config.goalBaseSpawnYMobile + goalHeight / 2;
      maxY = pageHeight - 50 - goalHeight / 2;
    } else {
      pageWidth = document.body.scrollWidth;
      pageHeight = document.body.scrollHeight;
      minY = App.config.goalBaseSpawnYDesktop + goalHeight / 2;
      maxY = pageHeight - goalHeight / 2;
    }
    maxX = pageWidth - goalWidth / 2;
    const maxAttempts = 100;
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
    if (!window.App.simulationLoaded) {
      // Do not reset recurring revenue when the game isn't running.
      return;
    }
    // 1) record this second’s auto-clicker income
    const thisRate = App.autoIncomeThisSecond || 0;

    // 2) push into history and trim to maxHistory
    history.push(thisRate);
    if (history.length > maxHistory) history.shift();

    // 3) recompute moving average
    currentPageRate = Math.round(
      history.reduce((sum, v) => sum + v, 0) / history.length
    );
    if (App.Achievements && App.Achievements.checkRps)
      App.Achievements.checkRps(currentPageRate);
    if (App.Achievements && App.Achievements.checkPages)
      App.Achievements.checkPages();

    // 4) update the on-page display
    const thisDisplay = document.getElementById("thispage-revenue-display");
    if (thisDisplay) {
      thisDisplay.innerHTML = window.App.simulationLoaded
        ? 'This page: <img src="' +
          coinCostURL +
          '" alt="Coin" style="width:12px;height:12px;"> ' +
          App.formatNumber(currentPageRate) +
          " /s"
        : "";
    }

    // 5) persist ALWAYS even if auto-clicker’s not active, because now we are checking for if revenue comes from autoclicker balls directly.  The below check that was here before was causing revenue not to be saved after the autoclicker was refunded.
    App.Persistence.saveRecurringRevenue(currentPageRate);

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
          App.formatNumber(otherRate) +
          " /s";
      } else {
        otherDisplay.innerHTML =
          "Other pages: " +
          '<img src="' +
          coinCostURL +
          '" alt="Coin" style="width:12px;height:12px;"> ' +
          App.formatNumber(otherRate) +
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
      if (App.Achievements && App.Achievements.checkRps)
        App.Achievements.checkRps(currentPageRate);
      if (App.Achievements && App.Achievements.checkPages)
        App.Achievements.checkPages();
    }
    App.updateCoinsDisplay();
    setInterval(updateRevenue, 1000);
    setInterval(addOtherPagesRevenue, 1000);
    setInterval(updateCoinInfoVisibility, 1000);
  }
  startRevenueUpdates();
})();

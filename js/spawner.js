/* spawner.js
 * Handles the ball-spawner click, forces a 333 ms glow before loading,
 * then starts the simulation and spawns the first ball.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Position spawner
  function positionSpawner() {
    const c = document.getElementById("spawner-container");
    if (!c) return;
    const xPos = window.innerWidth / App.config.spawnX + 5;
    c.style.left = xPos - c.offsetWidth / 2 + "px";
  }
  positionSpawner();
  window.addEventListener("resize", positionSpawner);

  const spawnerImg = document.getElementById("ball-spawner");
  if (!spawnerImg) return console.error("ball-spawner not found");

  let loadingActive = false;

  function startLoadingGlow() {
    if (loadingActive) return;
    loadingActive = true;
    spawnerImg.classList.add("bm-glow");
  }

  function flashPageWhite() {
    const f = document.createElement("div");
    Object.assign(f.style, {
      position: "fixed",
      inset: 0,
      background: "#fff",
      zIndex: 99999,
      pointerEvents: "none",
      opacity: "1",
      transition: "opacity 200ms ease",
    });
    document.body.appendChild(f);
    requestAnimationFrame(() => (f.style.opacity = "0"));
    setTimeout(() => f.remove(), 220);
  }

  function stopLoadingGlow() {
    if (!loadingActive) return;
    loadingActive = false;
    spawnerImg.classList.remove("bm-glow");
    flashPageWhite();
  }

  // Whichever happens last—text colliders or 25 s timeout—removes glow
  window.addEventListener("BallFallTextReady", stopLoadingGlow, { once: true });
  setTimeout(stopLoadingGlow, 25000);

  // Main click
  let lastClick = 0;
  spawnerImg.addEventListener("click", () => {
    gtag("event", "start_ball_machine", {
      event_category: "Ball Machine",
      event_label: "Spawner",
      value: 1,
    });
    const now = Date.now();
    if (now - lastClick < App.config.spawnCooldown) return;
    lastClick = now;

    if (!App.simulationLoaded) {
      startLoadingGlow();
      // WAIT 333 ms before any heavy loading
      setTimeout(() => {
        App.startSimulation();
        window.BallFall.spawnBall();
        spawnerImg.style.opacity = 1; // ← remove the pre-load transparency
      }, 150);
    } else {
      window.BallFall.spawnBall();
    }
  });

  // Legacy speed-up arrows (unchanged)
  const inc = document.getElementById("increaseSpeed");
  const dec = document.getElementById("decreaseSpeed");

  if (inc) {
    inc.addEventListener("click", () => {
      const lvl = App.config.maxUnlockedSpeedLevel + 1;
      const cost = App.config.speedUpgradeCosts[lvl];
      if (!cost || App.config.coins < cost)
        return window.notifyUnaffordable(100, 6);
      App.config.coins -= cost;
      App.config.maxUnlockedSpeedLevel = lvl;
      const newInt = App.config.originalSpawnInterval / Math.pow(2, lvl);
      App.config.spawnInterval = newInt;
      window.BallFall.updateSpawnInterval(newInt);
      App.updateCoinsDisplay();
    });
  }
  if (dec) {
    dec.addEventListener("click", () => {
      const newInt = App.config.spawnInterval * 2;
      if (newInt <= App.config.originalSpawnInterval) {
        App.config.spawnInterval = newInt;
        window.BallFall.updateSpawnInterval(newInt);
      }
    });
  }
});

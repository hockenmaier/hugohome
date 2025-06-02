/* static/js/goal.js */
(function () {
  /* Adjustable notification parameters. */
  const GOAL_NOTIF_FONT_SIZE = 16; // px
  const GOAL_NOTIF_DURATION = 1500; // ms before fade starts
  const GOAL_NOTIF_FADE_TIME = 500; // ms fade-out
  const GOAL_NOTIF_JITTER = 18; // ±px random offset

  // Reference to the current goal body.
  let goalBody;

  /* Attaches goal behaviour to the provided body. */
  function attach(body) {
    goalBody = body;
  }

  /*
   * Helper: display a notification at `pos`
   * text – notification text
   * color – css colour
   * pos – {x,y} collision point
   */
  function displayGoalNotification(text, color, pos) {
    if (!goalBody) return;
    const base = pos || goalBody.position;
    const jitterX = (Math.random() - 0.5) * 2 * GOAL_NOTIF_JITTER;
    const jitterY = (Math.random() - 0.5) * 2 * GOAL_NOTIF_JITTER;

    const el = document.createElement("div");
    el.textContent = text;
    Object.assign(el.style, {
      position: "absolute",
      left: base.x + jitterX + "px",
      top: base.y + jitterY + "px",
      transform: "translate(-50%,-50%)",
      fontWeight: "bold",
      fontSize: GOAL_NOTIF_FONT_SIZE + "px",
      color,
      textShadow: "1px 1px 2px black",
      zIndex: 10000,
    });
    document.body.appendChild(el);

    /* fade & cleanup */
    setTimeout(() => {
      el.style.transition = `opacity ${GOAL_NOTIF_FADE_TIME}ms`;
      el.style.opacity = "0";
      setTimeout(() => el.remove(), GOAL_NOTIF_FADE_TIME);
    }, GOAL_NOTIF_DURATION);
  }

  /* Handles ball-to-goal collisions. */
  function handleCollision(event) {
    event.pairs.forEach((pair) => {
      if (pair.bodyA !== goalBody && pair.bodyB !== goalBody) return;

      const other = pair.bodyA === goalBody ? pair.bodyB : pair.bodyA;
      if (other.label !== "BallFallBall") return;

      const speed = Math.hypot(other.velocity.x, other.velocity.y);
      const minSpeed = App.config.goalMinSpeed;

      /* prefer collision support point; fall back to goal centre */
      const hitPos =
        (pair.collision &&
          pair.collision.supports &&
          pair.collision.supports[0]) ||
        goalBody.position;

      if (speed < minSpeed) {
        /* Too slow – red warning. */
        displayGoalNotification("Too Slow!", "red", hitPos);
        return;
      }

      /* Determine income once. */
      const income = other.lastBallValue ?? other.value ?? other.baseValue ?? 0;

      /* Use ball colour for notification; fallback to gold if missing. */
      const notifColor = (other.render && other.render.fillStyle) || "#ffd700";

      if (other.hasBubble) {
        /* Pop bubble, keep ball alive. */
        const now = Date.now();
        if (now - (other._lastGoalHit || 0) < 200) return; // debounce
        other._lastGoalHit = now;
        other.hasBubble = false; //Pop!
        other.lastBubblePopTime = Date.now(); // new: start cooldown timer
      } else {
        /* Remove ball entirely. */
        Matter.World.remove(window.BallFall.world, other);
      }

      /* Credit coins & UI updates. */
      App.config.coins += income;
      if (other.spawnedByAuto) App.autoIncomeThisSecond += income;
      window.App.updateCoinsDisplay();

      displayGoalNotification(`+${income} Coins`, notifColor, hitPos);
    });
  }

  /* Register collision listener once simulation is ready. */
  function registerListener() {
    if (window.BallFall && window.BallFall.engine) {
      Matter.Events.on(
        window.BallFall.engine,
        "collisionStart",
        handleCollision
      );
    }
  }
  if (window.BallFall && window.BallFall.engine) {
    registerListener();
  } else {
    window.addEventListener("BallFallBaseReady", registerListener);
  }

  /* Expose attach() */
  App.modules.goal = { attach };
})();

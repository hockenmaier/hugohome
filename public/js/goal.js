(function () {
  // Adjustable notification parameters.
  const GOAL_NOTIF_FONT_SIZE = 16; // Font size in pixels for notifications.
  const GOAL_NOTIF_DURATION = 1500; // Time (ms) before the notification starts to fade.
  const GOAL_NOTIF_FADE_TIME = 500; // Fade-out duration (ms).
  const GOAL_NOTIF_JITTER = 18; // Random offset (in pixels, ±18) for both X and Y.

  // Reference to the current goal body
  let goalBody;

  // Attaches goal behavior to the provided body.
  function attach(body) {
    goalBody = body;
  }

  // Helper: Creates and displays a notification at the specified collision position.
  // text: notification text; color: CSS color; pos: the point (with x, y properties) where the collision occurred.
  function displayGoalNotification(text, color, pos) {
    if (!goalBody) return;
    // Determine the base position: use provided collision pos or fallback to goal center.
    const basePos = pos || goalBody.position;
    // Calculate randomized offsets (jitter).
    const jitterX = (Math.random() - 0.5) * 2 * GOAL_NOTIF_JITTER;
    const jitterY = (Math.random() - 0.5) * 2 * GOAL_NOTIF_JITTER;
    // Create the notification element.
    var notif = document.createElement("div");
    notif.textContent = text;
    // Style notification: center at collision point (with random jitter).
    notif.style.position = "absolute";
    notif.style.left = basePos.x + jitterX + "px";
    notif.style.top = basePos.y + jitterY + "px";
    notif.style.transform = "translate(-50%, -50%)";
    notif.style.fontWeight = "bold";
    notif.style.color = color;
    notif.style.fontSize = GOAL_NOTIF_FONT_SIZE + "px";
    notif.style.textShadow = "1px 1px 2px black";
    notif.style.zIndex = "10000";
    // Append to document body.
    document.body.appendChild(notif);
    // Fade out and remove the notification.
    setTimeout(function () {
      notif.style.transition = "opacity " + GOAL_NOTIF_FADE_TIME + "ms";
      notif.style.opacity = "0";
      setTimeout(function () {
        if (notif.parentNode) {
          notif.parentNode.removeChild(notif);
        }
      }, GOAL_NOTIF_FADE_TIME);
    }, GOAL_NOTIF_DURATION);
  }

  // Handles collision events by checking if a ball hit the goal with enough speed.
  function handleCollision(event) {
    event.pairs.forEach(function (pair) {
      if (pair.bodyA === goalBody || pair.bodyB === goalBody) {
        const other = pair.bodyA === goalBody ? pair.bodyB : pair.bodyA;
        if (other.label === "BallFallBall") {
          // Calculate the speed of the ball using its velocity vector.
          const speed = Math.hypot(other.velocity.x, other.velocity.y);
          const minSpeed = App.config.goalMinSpeed;
          // Extract collision point from the collision supports if available.
          var collisionPoint =
            (pair.collision &&
              pair.collision.supports &&
              pair.collision.supports[0]) ||
            goalBody.position;
          if (speed >= minSpeed) {
            // Remove the ball and update coins if the impact is strong enough.
            Matter.World.remove(window.BallFall.world, other);
            // Calculate the ball's income based on its age:
            // income = ballStartValue + floor((currentTime - spawnTime)/ballIncomeTimeStep) * ballIncomeIncrement
            const now = Date.now();
            const age = now - (other.spawnTime || now);
            const income =
              App.config.ballStartValue +
              Math.floor(age / App.config.ballIncomeTimeStep) *
                App.config.ballIncomeIncrement;
            App.config.coins += income;
            window.App.updateCoinsDisplay();
            // Use the ball's fillStyle as the notification color if available.
            const coinColor =
              (other.render && other.render.fillStyle) || "gold";
            // Show coin notification (big bold text in ball's color) at collision point.
            displayGoalNotification(
              "+" + income + " Coins",
              coinColor,
              collisionPoint
            );
          } else {
            // Ball was too slow; show notification (big bold red text) at collision point.
            displayGoalNotification("Too Slow!", "red", collisionPoint);
          }
        }
      }
    });
  }

  // Register collision listener once, after simulation is ready.
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

  // Expose the attach method as part of the module.
  App.modules.goal = {
    attach: attach,
  };
})();

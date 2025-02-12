/*
 * goal.js - Defines the behavior for a goal object.
 * When a ball collides with the goal with sufficient speed,
 * the ball is removed and the coin count is incremented.
 */
(function () {
  // Reference to the current goal body
  let goalBody;

  // Attaches goal behavior to the provided body.
  function attach(body) {
    goalBody = body;
    // Listen for collision events on the engine
    Matter.Events.on(window.BallFall.engine, "collisionStart", handleCollision);
  }

  // Handles collision events by checking if a ball hit the goal with enough speed.
  function handleCollision(event) {
    //console.log("goal collision");
    event.pairs.forEach(function (pair) {
      if (pair.bodyA === goalBody || pair.bodyB === goalBody) {
        const other = pair.bodyA === goalBody ? pair.bodyB : pair.bodyA;
        if (other.label === "BallFallBall") {
          // Calculate the speed of the ball using its velocity vector
          const speed = Math.hypot(other.velocity.x, other.velocity.y);
          const minSpeed = App.config.goalMinSpeed;
          if (speed >= minSpeed) {
            // Remove the ball and update coins if the impact is strong enough
            Matter.World.remove(window.BallFall.world, other);
            App.config.coins++;
            updateCoinDisplay();
          }
        }
      }
    });
  }

  // Updates the coin display element in the UI.
  function updateCoinDisplay() {
    const coinEl = document.getElementById("coins-display");
    if (coinEl) {
      coinEl.textContent = App.config.coins + " coins";
    }
  }

  // Expose the attach method as part of the module.
  App.modules.goal = {
    attach: attach,
  };
})();

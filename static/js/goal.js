(function () {
  // Reference to the current goal body
  let goalBody;

  // Attaches goal behavior to the provided body.
  function attach(body) {
    goalBody = body;
  }

  // Handles collision events by checking if a ball hit the goal with enough speed.
  function handleCollision(event) {
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

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

            // Determine base and step based on current mode (mobile vs. desktop)
            let base, step;
            if (window.innerWidth < 720) {
              base = App.config.goalBaseSpawnYMobile;
              step = App.config.goalIncomeStepMobile;
            } else {
              base = App.config.goalBaseSpawnYDesktop;
              step = App.config.goalIncomeStepDesktop;
            }
            // Compute income: floor((goalY - base) / step) + default income
            const income =
              Math.floor((goalBody.position.y - base) / step) +
              App.config.goalDefaultIncome;
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

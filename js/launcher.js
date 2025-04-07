/* static/js/launcher.js */
App.modules.launcher = (function () {
  // When a ball collides with a launcher, attempt to load it.
  function handleCollision(event) {
    event.pairs.forEach((pair) => {
      let launcher, ball;
      if (
        pair.bodyA.label === "Launcher" &&
        pair.bodyB.label === "BallFallBall"
      ) {
        launcher = pair.bodyA;
        ball = pair.bodyB;
      } else if (
        pair.bodyB.label === "Launcher" &&
        pair.bodyA.label === "BallFallBall"
      ) {
        launcher = pair.bodyB;
        ball = pair.bodyA;
      }
      if (!launcher || !ball || !launcher.launchForce || launcher.isPreview)
        return;

      // If this ball is already loaded in a launcher, update its last-collision time if in the same launcher.
      if (ball.currentLauncher) {
        if (ball.currentLauncher === launcher.id) {
          ball._lastCollideTime = Date.now();
        }
        return;
      }

      // Enforce a 1500ms cooldown per launcher.
      ball._launcherCooldown = ball._launcherCooldown || {};
      const now = Date.now();
      if (
        ball._launcherCooldown[launcher.id] &&
        now - ball._launcherCooldown[launcher.id] < 1500
      ) {
        return;
      }
      ball._launcherCooldown[launcher.id] = now;

      // Mark the ball as loaded by this launcher.
      ball.currentLauncher = launcher.id;
      ball._launcherRef = launcher;
      ball._lastCollideTime = now;

      // Suck the ball into the launcher’s center and zero its velocity.
      Matter.Body.setPosition(ball, {
        x: launcher.position.x,
        y: launcher.position.y,
      });
      Matter.Body.setVelocity(ball, { x: 0, y: 0 });

      // Disable gravity for this ball.
      ball.ignoreGravity = true;

      // Schedule the launch after the launcher’s delay.
      ball._launcherTimeout = setTimeout(() => {
        // At launch time, check if the ball is still loaded in this launcher.
        // Use a short threshold to allow for minor physics jitter.
        const timeSinceLast = Date.now() - ball._lastCollideTime;
        const collisionThreshold = 100; // ms
        const collision = Matter.SAT.collides(launcher, ball);
        if (
          ball.currentLauncher === launcher.id &&
          timeSinceLast < collisionThreshold &&
          collision &&
          collision.collided
        ) {
          Matter.Body.setVelocity(ball, {
            x: launcher.launchForce.x,
            y: launcher.launchForce.y,
          });
        }
        // In any case, re-enable gravity and clear the ball's launcher state.
        ball.ignoreGravity = false;
        ball.currentLauncher = null;
        ball._launcherRef = null;
        ball._launcherTimeout = null;
      }, launcher.delay);
    });
  }

  // On every update, check loaded balls.
  // - If a loaded ball is still colliding with its launcher, update its last-collision time and neutralize vertical velocity.
  // - If it's not colliding for longer than a short threshold, cancel its loading state.
  function updateLoadedBalls() {
    const now = Date.now();
    window.BallFall.engine.world.bodies.forEach((body) => {
      if (body.label === "BallFallBall" && body.currentLauncher) {
        // If there's no valid launcher or the ball is not colliding...
        const launcher = body._launcherRef;
        const collision = launcher && Matter.SAT.collides(launcher, body);
        if (!launcher || !collision || !collision.collided) {
          if (!body._lastCollideTime) {
            body._lastCollideTime = now;
          }
          if (now - body._lastCollideTime > 100) {
            if (body._launcherTimeout) {
              clearTimeout(body._launcherTimeout);
              body._launcherTimeout = null;
            }
            body.ignoreGravity = false;
            body.currentLauncher = null;
            body._launcherRef = null;
          }
        } else {
          body._lastCollideTime = now;
          Matter.Body.setVelocity(body, { x: body.velocity.x, y: 0 });
        }
      }
    });
  }

  function attachEvents() {
    Matter.Events.on(window.BallFall.engine, "collisionStart", handleCollision);
    Matter.Events.on(
      window.BallFall.engine,
      "collisionActive",
      handleCollision
    );
    Matter.Events.on(window.BallFall.engine, "afterUpdate", updateLoadedBalls);
  }

  function init() {
    if (window.BallFall && window.BallFall.engine) {
      attachEvents();
    } else {
      window.addEventListener("BallFallBaseReady", attachEvents);
    }
  }

  return { init };
})();

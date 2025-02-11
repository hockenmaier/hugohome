/* static/js/launcher.js */
App.modules.launcher = (function () {
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
      if (launcher && ball && launcher.launchForce && !launcher.isPreview) {
        const now = Date.now();
        ball._launcherCooldown = ball._launcherCooldown || {};
        if (
          !ball._launcherCooldown[launcher.id] ||
          now - ball._launcherCooldown[launcher.id] > 1500
        ) {
          ball._launcherCooldown[launcher.id] = now;
          // Suck the ball into the launcher’s center
          Matter.Body.setPosition(ball, {
            x: launcher.position.x,
            y: launcher.position.y,
          });
          Matter.Body.setVelocity(ball, { x: 0, y: 0 });
          // After the launcher’s delay, launch the ball using the launcher’s force
          setTimeout(() => {
            Matter.Body.setVelocity(ball, {
              x: launcher.launchForce.x,
              y: launcher.launchForce.y,
            });
          }, launcher.delay);
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

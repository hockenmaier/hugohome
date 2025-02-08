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
        if (!ball.hasLaunched) {
          ball.hasLaunched = true;
          // Suck ball into launcher center
          Matter.Body.setPosition(ball, {
            x: launcher.position.x,
            y: launcher.position.y,
          });
          Matter.Body.setVelocity(ball, { x: 0, y: 0 });
          // After 200ms, launch the ball
          setTimeout(() => {
            Matter.Body.setVelocity(ball, {
              x: launcher.launchForce.x,
              y: launcher.launchForce.y,
            });
          }, 100);
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

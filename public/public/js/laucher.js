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
        // Apply force only once per ball per launcher.
        if (ball.launchedBy !== launcher.id) {
          Matter.Body.applyForce(ball, ball.position, launcher.launchForce);
          ball.launchedBy = launcher.id;
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

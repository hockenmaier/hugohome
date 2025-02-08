/* static/js/launcher.js */
App.modules.launcher = (function () {
  function attachEvents() {
    Matter.Events.on(
      window.BallFall.engine,
      "collisionStart",
      function (event) {
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
          // Only apply force if this launcher is placed (not preview) and has a launchForce
          if (launcher && ball && launcher.launchForce && !launcher.isPreview) {
            Matter.Body.applyForce(ball, ball.position, launcher.launchForce);
          }
        });
      }
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

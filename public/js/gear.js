/* static/js/gear.js
 * Attaches rotation to every Gear body each engine tick.
 */
(function () {
  function spinGears() {
    if (!window.BallFall) return;
    const step =
      (((2 * Math.PI) / App.config.gearRotationDuration) *
        (window.BallFall.engine.timing.lastDelta || 16.6)) /
      1000;

    Matter.Composite.allBodies(window.BallFall.world).forEach((b) => {
      if (b.label === "Gear") {
        Matter.Body.rotate(b, step * (b.spinDir || 1));
        if (b.origin) Matter.Body.setPosition(b, b.origin); // keep from drifting
      }
    });
  }
  function init() {
    Matter.Events.on(window.BallFall.engine, "afterUpdate", spinGears);
  }
  window.BallFall && window.BallFall.engine
    ? init()
    : window.addEventListener("BallFallBaseReady", init);
})();

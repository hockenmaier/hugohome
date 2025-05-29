/* static/js/gear.js
 * Gives every Gear body its own GSAP timeline so it spins forever
 * without relying on mass or Engine updates (mirrors compactor style).
 */
(function () {
  const TWO_PI = Math.PI * 2;

  /** build + start an endless rotation timeline for one gear body */
  function startGearAnimation(body) {
    // One param object so we can animate a scalar 0→1 and convert to angle
    const prog = { t: 0 };
    const dir = body.spinDir || 1;
    const dur = App.config.gearRotationDuration / 1000; // ms→s

    gsap.to(prog, {
      t: 1,
      duration: dur,
      ease: "none",
      repeat: -1,
      onUpdate() {
        Matter.Body.setAngle(body, prog.t * TWO_PI * dir);
        if (body.origin) Matter.Body.setPosition(body, body.origin); // keep pinned
      },
    });
  }

  /* after physics is ready, find any gears already in the world and animate */
  function init() {
    Matter.Composite.allBodies(window.BallFall.world).forEach((b) => {
      if (b.label === "Gear") startGearAnimation(b);
    });

    /* make new gears spin the moment they’re added */
    Matter.Events.on(window.BallFall.engine, "afterAdd", (ev) => {
      const arr = Array.isArray(ev.object) ? ev.object : [ev.object];
      arr.forEach((b) => {
        if (b.label === "Gear") startGearAnimation(b);
      });
    });

    /* allow GearCreateTool to start one right away */
    window.__startGearAnim = startGearAnimation;
  }

  window.BallFall && window.BallFall.engine
    ? init()
    : window.addEventListener("BallFallBaseReady", init);
})();

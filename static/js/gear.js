/* static/js/gear.js
 * Gear class: static parts + GSAP rotation.
 */
(function () {
  const tex = "images/gear-30.png";
  const gears = []; // all live gear objects
  const STEP = (2 * Math.PI) / App.config.gearRotationDuration;

  /* constructor ---------------------------------------------------------- */
  window.Gear = function (pos, type) {
    this.dir = type === "gear-ccw" ? -1 : 1;
    this.origin = pos;
    this.scale = (App.config.ballSize * App.config.gearSizeMultiplier) / 100;
    this.angle = 0;

    // build parts from vertex groups
    const parts = buildGearVertices(this.scale).map((v) =>
      Matter.Bodies.fromVertices(
        pos.x,
        pos.y,
        [v],
        { isStatic: true, render: { visible: false }, label: "GearPart" },
        true
      )
    );
    parts.forEach((p) => {
      p.isGear = true;
      p.persistenceId = this.id;
    });

    // sprite body – sensor, so only for drawing
    this.sprite = Matter.Bodies.circle(pos.x, pos.y, 1, {
      isStatic: true,
      isSensor: true,
      render: {
        sprite: { texture: tex, xScale: this.scale, yScale: this.scale },
      },
    });

    Matter.World.add(window.BallFall.world, [...parts, this.sprite]);
    this.parts = parts;
  };

  /* rotation each tick --------------------------------------------------- */
  function rotateAll(dt) {
    const dA = (STEP * dt) / 1000;
    gears.forEach((g) => {
      g.angle += dA * g.dir;
      const cos = Math.cos(g.angle),
        sin = Math.sin(g.angle);
      g.parts.forEach((p) => {
        // rotate centre
        const dx = p.initialX,
          dy = p.initialY;
        const x = g.origin.x + dx * cos - dy * sin;
        const y = g.origin.y + dx * sin + dy * cos;
        Matter.Body.setPosition(p, { x, y });
        Matter.Body.setAngle(p, g.angle);
      });
      Matter.Body.setAngle(g.sprite, g.angle);
    });
  }

  /* save initial offsets once World is ready ----------------------------- */
  function onReady() {
    // hook into engine
    let last = Date.now();
    Matter.Events.on(window.BallFall.engine, "beforeUpdate", () => {
      const now = Date.now(),
        dt = now - last;
      last = now;
      rotateAll(dt);
    });
  }
  window.BallFall
    ? onReady()
    : window.addEventListener("BallFallBaseReady", onReady);

  /* export helper to create & track gears -------------------------------- */
  window.createGear = function (pos, type) {
    const g = new Gear(pos, type);
    // store offsets for fast rotation maths
    g.parts.forEach((p) => {
      p.initialX = p.position.x - g.origin.x;
      p.initialY = p.position.y - g.origin.y;
    });
    gears.push(g);
    return g;
  };
})();

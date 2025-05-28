/* static/js/gear-config.js
 * One source of truth for gear geometry.
 *   – edit GEAR_SETTINGS below to tweak live
 *   – helper returns convex parts already centred at (0,0) and
 *     scaled to the sprite scale you pass.
 */
(function () {
  /* ---------- tweak here ---------- */
  window.GEAR_SETTINGS = {
    circleRadius: 377, // inner hub radius (px before scaling)
    toothAngles: [
      8.002,
      20.2289,
      32.4558,
      44.6827,
      56.9096,
      69.1365,
      81.3634,
      98.8264, // special gap between 7th and 8th (1.428× normal)
      111.0533,
      123.2802,
      135.5071,
      147.734,
      159.9609,
      172.1878,
      184.4147,
      196.6416,
      208.8685,
      221.0954,
      233.3223,
      245.5492,
      257.7761,
      270.0, // exact
      282.2269,
      294.4538,
      306.6807,
      318.9076,
      331.1345,
      343.3614,
      355.5883,
    ],
    toothLength: 30, // protrusion distance
    toothWidth: 60, // rectangle width
  };
  /* -------------------------------- */

  window.getScaledGearParts = function (spriteScale) {
    const p = window.GEAR_SETTINGS;
    const R = p.circleRadius * spriteScale;
    const TL = p.toothLength * spriteScale;
    const TW = p.toothWidth * spriteScale;

    const parts = [];

    /* hub circle */
    parts.push(Matter.Bodies.circle(0, 0, R, { isStatic: true }));

    /* each tooth is a rectangle centred at (R+TL/2) and rotated to angle */
    p.toothAngles.forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      const cx = (R + TL / 2) * Math.cos(rad);
      const cy = (R + TL / 2) * Math.sin(rad);
      parts.push(
        Matter.Bodies.rectangle(cx, cy, TW, TL, { isStatic: true, angle: rad })
      );
    });

    return parts;
  };
})();

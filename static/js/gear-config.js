/* static/js/gear-config.js
 * Tunables — edit live and reload.
 */
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

/* helper: returns vertex arrays already centred+scaled */
window.buildGearVertices = function (spriteScale) {
  const s = window.GEAR_SETTINGS;
  const R = s.circleRadius * spriteScale;
  const TL = s.toothLength * spriteScale;
  const TW = s.toothWidth * spriteScale;

  const verts = [];

  // hub – use a 6-sided polygon to approximate the circle (cheaper than 100 verts)
  const hub = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    hub.push({ x: R * Math.cos(a), y: R * Math.sin(a) });
  }
  verts.push(hub);

  // teeth rectangles
  s.toothAngles.forEach((deg) => {
    const rad = (deg * Math.PI) / 180;
    const cx = (R + TL / 2) * Math.cos(rad),
      cy = (R + TL / 2) * Math.sin(rad);
    const w = TW / 2,
      h = TL / 2;
    // rectangle vertices relative to its centre then rotated
    [
      [-w, -h],
      [w, -h],
      [w, h],
      [-w, h],
    ].forEach(([lx, ly], idx) => {
      const x = cx + lx * Math.cos(rad) - ly * Math.sin(rad);
      const y = cy + lx * Math.sin(rad) + ly * Math.cos(rad);
      (
        verts[verts.length - 1 - idx] ||
        (verts.push([]) && verts[verts.length - 1])
      ).push({ x, y });
    });
  });

  return verts;
};

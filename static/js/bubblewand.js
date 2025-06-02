/* static/js/bubblewand.js
 * A static sensor: balls that pass through gain `hasBubble=true`.
 */
(function () {
  const p = BubbleWandConfig.getParams();

  window.BubbleWand = function (pos, angle) {
    const body = Matter.Bodies.circle(pos.x, pos.y, p.radius, {
      isStatic: true,
      isSensor: true,
      angle,
      render: {
        sprite: {
          texture: "images/bubblewand.png",
          xScale: p.scale,
          yScale: p.scale,
        },
      },
      label: "BubbleWandSensor",
    });
    body.isBubbleWand = true;
    Matter.World.add(window.BallFall.world, body);

    // collision handler – grant bubble once per entry
    Matter.Events.on(window.BallFall.engine, "collisionStart", (e) => {
      e.pairs.forEach((pair) => {
        let ball, sensor;
        if (pair.bodyA.label === "BallFallBall" && pair.bodyB === body) {
          ball = pair.bodyA;
          sensor = pair.bodyB;
        } else if (pair.bodyB.label === "BallFallBall" && pair.bodyA === body) {
          ball = pair.bodyB;
          sensor = pair.bodyA;
        }
        if (!ball || !sensor) return;
        if (!ball.hasBubble) {
          ball.hasBubble = true;
        }
      });
    });
  };
})();

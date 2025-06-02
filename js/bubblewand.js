/* static/js/bubblewand.js
 * A static sensor: balls that pass through gain `hasBubble = true`.
 * Now returns an object { body } so callers can attach persistenceId.
 */
(function () {
  const p = BubbleWandConfig.getParams();

  window.BubbleWand = function (pos, angle) {
    const body = Matter.Bodies.circle(pos.x, pos.y, p.radius, {
      isStatic: true,
      isSensor: true,
      angle,
      label: "BubbleWandSensor",
      render: {
        sprite: {
          texture: "images/bubblewand.png",
          xScale: p.scale,
          yScale: p.scale,
        },
      },
    });
    body.isBubbleWand = true; // ← so line-interaction can recognise it
    Matter.World.add(window.BallFall.world, body);

    /* grant a bubble once per entry */
    Matter.Events.on(window.BallFall.engine, "collisionStart", (e) => {
      e.pairs.forEach((pair) => {
        let ball;
        if (pair.bodyA === body && pair.bodyB.label === "BallFallBall") {
          ball = pair.bodyB;
        } else if (pair.bodyB === body && pair.bodyA.label === "BallFallBall") {
          ball = pair.bodyA;
        }
        if (ball && !ball.hasBubble) ball.hasBubble = true;
      });
    });

    /* returned so the creator can tag persistenceId */
    return { body };
  };
})();

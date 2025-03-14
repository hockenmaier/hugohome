/*
 * game.js - High-level game management.
 * Spawns the goal object randomly on the page and attaches its behavior (defined in goal.js).
 * It waits until text colliders are present and ensures the goal is fully within document boundaries,
 * does not overlap any existing collider (including text colliders), and is at least 50px from the top.
 */
(function () {
  let goalSpawned = false;

  function spawnGoal() {
    if (goalSpawned) return;
    const Bodies = Matter.Bodies,
      World = Matter.World,
      Composite = Matter.Composite,
      world = window.BallFall.world,
      goalWidth = 40,
      goalHeight = 40,
      pageWidth = document.body.scrollWidth,
      pageHeight = document.body.scrollHeight,
      // Ensure the goal's edges remain within the page.
      minX = goalWidth / 2,
      maxX = pageWidth - goalWidth / 2,
      // Ensure the goal is at least 200px from the top so we can build up a little speed:
      minY = 200 + goalHeight / 2,
      maxY = pageHeight - goalHeight / 2,
      maxAttempts = 100;
    let attempt = 0,
      candidate;

    do {
      const x = Math.random() * (maxX - minX) + minX;
      const y = Math.random() * (maxY - minY) + minY;
      candidate = Bodies.circle(x, y, goalWidth / 2, {
        isStatic: true,
        isSensor: true,
        label: "Goal",
        render: {
          sprite: {
            texture: goalTexture,
            xScale: goalWidth / 100,
            yScale: goalHeight / 100,
          },
          visible: true,
        },
      });
      // Ensure candidate bounds are updated.
      Matter.Body.setPosition(candidate, { x: x, y: y });
      Matter.Body.update(candidate, 0, 0, 0);

      let collides = false;
      const bodies = Composite.allBodies(world);
      for (let b of bodies) {
        if (b === candidate) continue;
        if (b.isStatic && b.label !== "BallFallBall" && b.label !== "Goal") {
          // For text colliders (SPAN), use bounding-box overlap.
          if (b.elRef && b.elRef.tagName === "SPAN") {
            if (Matter.Bounds.overlaps(candidate.bounds, b.bounds)) {
              collides = true;
              break;
            }
          } else {
            const collision = Matter.SAT.collides(candidate, b);
            if (collision && collision.collided) {
              collides = true;
              break;
            }
          }
        }
      }
      if (!collides) break;
      attempt++;
    } while (attempt < maxAttempts);

    // If no valid location is found after maxAttempts, candidate is still added.
    World.add(world, candidate);
    if (App.modules.goal && typeof App.modules.goal.attach === "function") {
      App.modules.goal.attach(candidate);
    }
    goalSpawned = true;
  }

  // Waits until at least one text collider (a body with an elRef referencing a SPAN) exists.
  function waitForTextColliders(callback) {
    const Composite = Matter.Composite,
      world = window.BallFall.world;
    const bodies = Composite.allBodies(world);
    const hasTextColliders = bodies.some(
      (b) => b.elRef && b.elRef.tagName === "SPAN"
    );
    if (hasTextColliders) {
      callback();
    } else {
      setTimeout(() => waitForTextColliders(callback), 100);
    }
  }

  function initSpawn() {
    if (window.BallFall && window.BallFall.engine) {
      waitForTextColliders(spawnGoal);
    } else {
      window.addEventListener("BallFallBaseReady", function () {
        waitForTextColliders(spawnGoal);
      });
    }
  }

  initSpawn();
})();

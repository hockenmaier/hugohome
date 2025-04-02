(function () {
  let goalSpawned = false;

  function spawnGoal() {
    if (goalSpawned) return;
    const Bodies = Matter.Bodies,
      World = Matter.World,
      Composite = Matter.Composite,
      world = window.BallFall.world,
      goalWidth = 40,
      goalHeight = 40;

    let pageWidth, pageHeight, minY;
    if (window.innerWidth < 720) {
      pageWidth = window.innerWidth;
      pageHeight = window.innerHeight;
      minY = 500 + goalHeight / 2;
    } else {
      pageWidth = document.body.scrollWidth;
      pageHeight = document.body.scrollHeight;
      minY = 300 + goalHeight / 2;
    }
    const maxX = pageWidth - goalWidth / 2,
      maxY = pageHeight - goalHeight / 2,
      maxAttempts = 100;
    let attempt = 0,
      candidate;

    do {
      const x = Math.random() * (maxX - goalWidth / 2) + goalWidth / 2;
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
      Matter.Body.setPosition(candidate, { x: x, y: y });
      Matter.Body.update(candidate, 0, 0, 0);

      let collides = false;
      const bodies = Composite.allBodies(world);
      for (let b of bodies) {
        if (b === candidate) continue;
        if (b.isStatic && b.label !== "BallFallBall" && b.label !== "Goal") {
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

    World.add(world, candidate);
    if (App.modules.goal && typeof App.modules.goal.attach === "function") {
      App.modules.goal.attach(candidate);
    }
    candidate.isPersistent = true;
    goalSpawned = true;
    if (App.savePlacedObjects) App.savePlacedObjects();
  }

  function waitForTextColliders(callback) {
    if (window.innerWidth < 720) {
      callback();
      return;
    }
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
      var stored = App.Storage.getItem(
        "pageObjects_" + window.location.pathname,
        null
      );
      var hasGoal = false;
      if (stored) {
        for (var i = 0; i < stored.length; i++) {
          if (stored[i].label === "Goal") {
            hasGoal = true;
            break;
          }
        }
      }
      if (!hasGoal) {
        waitForTextColliders(spawnGoal);
      } else {
        goalSpawned = true;
      }
    } else {
      window.addEventListener("BallFallBaseReady", initSpawn);
    }
  }

  initSpawn();
})();

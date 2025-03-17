App.modules.base = (function () {
  let engine, render;
  function init() {
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Events = Matter.Events;

    Matter.use("matter-wrap");

    // Inject canvas style if missing
    if (!document.getElementById("ballfall-style")) {
      const styleEl = document.createElement("style");
      styleEl.id = "ballfall-style";
      styleEl.textContent =
        "#ballfallCanvas { position: fixed; top: 0; left: 0; z-index: 9999; pointer-events: none; }";
      document.head.appendChild(styleEl);
    }

    window.BallFall = {};
    engine = Engine.create();
    engine.world.gravity.y = App.config.gravity;
    window.BallFall.engine = engine;
    window.BallFall.world = engine.world;

    // Create canvas & renderer.
    const canvasEl = document.createElement("canvas");
    canvasEl.id = "ballfallCanvas";
    document.body.appendChild(canvasEl);

    render = Render.create({
      engine: engine,
      canvas: canvasEl,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: "transparent",
        wireframes: false,
        pixelRatio: 1,
      },
    });
    engine.timing.timeScale = App.config.timeScale;
    window.BallFall.render = render;

    Render.run(render);

    // Run physics substeps.
    const substeps = 2;
    const baseDt = 1000 / 60;
    const dt = baseDt / substeps;
    setInterval(() => {
      for (let i = 0; i < substeps; i++) {
        Matter.Engine.update(engine, dt * engine.timing.timeScale);
      }
    }, baseDt);

    function resize() {
      render.options.width = window.innerWidth;
      render.options.height = window.innerHeight;
      canvasEl.width = window.innerWidth;
      canvasEl.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    // Media colliders.
    function addMediaColliders() {
      document.querySelectorAll("img, iframe").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;
        const cx = rect.left + rect.width / 2 + window.scrollX;
        const cy = rect.top + rect.height / 2 + window.scrollY;
        const box = Bodies.rectangle(cx, cy, rect.width, rect.height, {
          isStatic: true,
          render: { visible: false },
        });
        box.elRef = el;
        World.add(engine.world, box);
      });
    }
    addMediaColliders();

    // ---- Ball spawning logic ----
    const ballsList = [];
    // Expose spawnBall() for manual or auto-triggered spawning.
    let isAnimating = false;
    const totalFrames = 9;
    const frameDuration = 60; // 80 ms per frame
    const animationFrames = Array.from(
      { length: totalFrames },
      (_, i) => `images/ball-chute-hatch-${i + 1}.png`
    );

    function playSpawnerAnimation(frame = 0) {
      const spawnerImg = document.getElementById("ball-spawner");
      if (!spawnerImg) return;

      isAnimating = true;
      spawnerImg.src = animationFrames[frame];

      if (frame < totalFrames - 1) {
        setTimeout(() => playSpawnerAnimation(frame + 1), frameDuration);
      } else {
        isAnimating = false;
        spawnerImg.src = animationFrames[0];
      }
    }

    function spawnBall() {
      if (!window.BallFall.firstBallDropped) {
        window.BallFall.firstBallDropped = true;
        const autoBtn = document.getElementById("autoClicker");
        const dropIndicator = document.getElementById("spawner-indicator");
        if (autoBtn) autoBtn.style.display = "none";
        if (dropIndicator) dropIndicator.style.display = "flex";
      }

      const spawnX = window.scrollX + window.innerWidth / App.config.spawnX;
      const spawnY = 0;
      const ball = Matter.Bodies.circle(spawnX, spawnY, App.config.ballSize, {
        restitution: App.config.restitution,
        friction: 0,
        frictionAir: 0,
        render: { fillStyle: "#e6e6e6" },
        plugin: {
          wrap: {
            min: { x: 0, y: -999999 },
            max: { x: document.body.scrollWidth, y: 999999 },
          },
        },
        label: "BallFallBall",
      });
      Matter.World.add(window.BallFall.world, ball);
      ballsList.push(ball);

      // Trigger animation ONLY if not already animating
      if (!isAnimating) {
        playSpawnerAnimation();
      }
    }

    window.BallFall.spawnBall = spawnBall;

    // Auto-spawner: not started until auto-clicker is purchased.
    let spawnIntervalId = null;
    function startAutoSpawner() {
      if (spawnIntervalId) return;
      spawnIntervalId = setInterval(spawnBall, App.config.spawnInterval);
    }
    window.BallFall.startAutoSpawner = startAutoSpawner;

    function updateSpawnInterval(newInterval) {
      if (spawnIntervalId) {
        clearInterval(spawnIntervalId);
        spawnIntervalId = setInterval(spawnBall, newInterval);
      }
      window.BallFall.spawnInterval = newInterval;
      App.config.spawnInterval = newInterval;
    }
    window.BallFall.updateSpawnInterval = updateSpawnInterval;
    window.BallFall.clearBalls = () => {
      ballsList.forEach((body) => World.remove(engine.world, body));
      ballsList.length = 0;
    };

    // Collision effect and ball removal logic remain unchanged.
    Events.on(engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        [pair.bodyA, pair.bodyB].forEach((b) => {
          if (b.elRef && b.elRef.tagName !== "SPAN") {
            b.elRef.style.border = "1px dotted #6eff94";
          }
        });
      });
    });

    const ballPositionData = {};
    function removeBallsBelowPage() {
      const bodies = Composite.allBodies(engine.world);
      const pageBottom = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      bodies.forEach((body) => {
        if (body.label === "BallFallBall" && body.position.y > pageBottom) {
          World.remove(engine.world, body);
          delete ballPositionData[body.id];
        }
      });
    }
    function removeStillBalls() {
      const bodies = Composite.allBodies(engine.world);
      bodies.forEach((body) => {
        if (body.label === "BallFallBall") {
          const prev = ballPositionData[body.id] || {
            x: body.position.x,
            y: body.position.y,
            stillCount: 0,
          };
          const dx = Math.abs(body.position.x - prev.x);
          const dy = Math.abs(body.position.y - prev.y);
          if (
            dx < App.config.sitStillDeleteMargin &&
            dy < App.config.sitStillDeleteMargin
          )
            prev.stillCount++;
          else prev.stillCount = 0;
          prev.x = body.position.x;
          prev.y = body.position.y;
          if (prev.stillCount >= App.config.sitStillDeleteSeconds) {
            World.remove(engine.world, body);
            delete ballPositionData[body.id];
          } else {
            ballPositionData[body.id] = prev;
          }
        }
      });
    }
    setInterval(() => {
      removeBallsBelowPage();
      removeStillBalls();
    }, 1000);

    console.log("Base module initialized, dispatching BallFallBaseReady");
    window.dispatchEvent(new Event("BallFallBaseReady"));
  }
  return { init };
})();

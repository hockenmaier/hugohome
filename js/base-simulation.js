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
    const substeps = 6;
    const baseDt = 1000 / 60;
    const dt = baseDt / substeps;
    setInterval(() => {
      for (let i = 0; i < substeps; i++) {
        Matter.Engine.update(engine, dt * engine.timing.timeScale);
      }
    }, baseDt);

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      render.options.width = window.innerWidth;
      render.options.height = window.innerHeight;
      // Set the canvas resolution to CSS size times the device pixel ratio
      canvasEl.width = window.innerWidth * ratio;
      canvasEl.height = window.innerHeight * ratio;
      // Keep the canvas displayed at the CSS pixel size
      canvasEl.style.width = window.innerWidth + "px";
      canvasEl.style.height = window.innerHeight + "px";
      // Tell Matter.Render to use the new pixel ratio
      Matter.Render.setPixelRatio(render, ratio);
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
    const BALL_CATEGORY = 0x0002;

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

    // Expose spawnBall() for manual or auto-triggered spawning.
    function spawnBall() {
      if (!window.BallFall.firstBallDropped) {
        window.BallFall.firstBallDropped = true;
        const autoBtn = document.getElementById("autoClicker");
        const dropIndicator = document.getElementById("spawner-indicator");
        if (dropIndicator) dropIndicator.style.display = "flex";
      }

      // Start the animation immediately
      if (!isAnimating) {
        playSpawnerAnimation();
      }

      // Delay only the ball spawning
      setTimeout(() => {
        const spawnX = window.scrollX + window.innerWidth / App.config.spawnX;
        const spawnY = 55;
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
          // Assign the custom ball category and default full mask.
          collisionFilter: {
            category: BALL_CATEGORY,
            mask: 0xffffffff,
          },
        });
        // Set the spawn time for time-based income calculations.
        ball.spawnTime = Date.now();

        // Temporarily disable collisions with other balls by removing the BALL_CATEGORY bit.
        const disableDuration = App.config.disableDuration; // milliseconds
        ball.collisionFilter.mask = 0xffffffff & ~BALL_CATEGORY;
        setTimeout(() => {
          ball.collisionFilter.mask = 0xffffffff;
        }, disableDuration);

        Matter.World.add(window.BallFall.world, ball);
        ballsList.push(ball);
      }, 300); // Adjust delay as needed
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
    }, 500);

    // Convert a hex color to an HSL object.
    function hexToHSL(hex) {
      let r = parseInt(hex.substr(1, 2), 16) / 255,
        g = parseInt(hex.substr(3, 2), 16) / 255,
        b = parseInt(hex.substr(5, 2), 16) / 255;
      let max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      let h,
        s,
        l = (max + min) / 2;
      if (max === min) {
        h = s = 0; // achromatic
      } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) {
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        } else if (max === g) {
          h = ((b - r) / d + 2) / 6;
        } else {
          h = ((r - g) / d + 4) / 6;
        }
      }
      return { h: h, s: s, l: l };
    }

    // Convert an HSL object to hex.
    function HSLToHex(h, s, l) {
      let hue2rgb = function (p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      let toHex = function (x) {
        let hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      };
      return "#" + toHex(r) + toHex(g) + toHex(b);
    }

    // Interpolate between two hex colors in HSL space.
    function interpolateColorHSL(color1, color2, t) {
      let hsl1 = hexToHSL(color1);
      let hsl2 = hexToHSL(color2);
      // For a brighter look, you can choose to keep lightness fixed if desired.
      let h = hsl1.h + (hsl2.h - hsl1.h) * t;
      let s = hsl1.s + (hsl2.s - hsl1.s) * t;
      let l = hsl1.l + (hsl2.l - hsl1.l) * t;
      return HSLToHex(h, s, l);
    }

    // Update getBallColor to use HSL interpolation.
    function getBallColor(value) {
      var thresholds = App.config.ballColorThresholds;
      for (var i = 0; i < thresholds.length - 1; i++) {
        if (value >= thresholds[i].value && value < thresholds[i + 1].value) {
          var lower = thresholds[i];
          var upper = thresholds[i + 1];
          var ratio = (value - lower.value) / (upper.value - lower.value);
          return interpolateColorHSL(lower.color, upper.color, ratio);
        }
      }
      return thresholds[thresholds.length - 1].color;
    }

    // --- afterRender hook (unchanged except for calling getBallColor) ---
    Matter.Events.on(render, "afterRender", function () {
      const context = render.context;
      const now = Date.now();
      Matter.Render.startViewTransform(render);
      const bodies = Matter.Composite.allBodies(engine.world);
      bodies.forEach(function (body) {
        if (body.label === "BallFallBall") {
          const age = now - (body.spawnTime || now);
          const ballValue =
            App.config.ballStartValue +
            Math.floor(age / App.config.ballIncomeTimeStep) *
              App.config.ballIncomeIncrement;
          // Only update the ball's color if its value has changed.
          if (ballValue !== body.lastBallValue) {
            body.render.fillStyle = getBallColor(ballValue);
            body.lastBallValue = ballValue;
          }
          context.save();
          const fontSize = ballValue < 100 ? 10 : 5;
          context.font = `bold ${fontSize}px Consolas`;
          context.fillStyle = "#1f1b0a";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(ballValue, body.position.x, body.position.y);
          context.restore();
        }
      });
      Matter.Render.endViewTransform(render);
    });

    console.log("Base module initialized, dispatching BallFallBaseReady");
    window.dispatchEvent(new Event("BallFallBaseReady"));
  }
  return { init };
})();

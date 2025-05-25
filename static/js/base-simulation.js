/* static/js/base-simulation.js */
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
        wireframes: false, // good for physics debug
        showConvexHulls: false, // draw hulls & verts
        showInternalEdges: false, // multi-part bodies
        showAxes: false, // good for physics debug
        showPositions: false, // good for physics debug
        showBounds: false, // good for physics debug
        showCollisions: false, // good for physics debug
        pixelRatio: 1,
      },
    });
    engine.timing.timeScale = App.config.timeScale;
    window.BallFall.render = render;

    Render.run(render);

    // Run physics substeps.
    // Tune this down for better performance, up for better physics consistency
    const isMobileLike =
      navigator.userAgentData?.mobile === true ||
      /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      (window.innerWidth < 620 && navigator.hardwareConcurrency <= 4);

    const substeps = isMobileLike ? 2 : 4; // mobile 1, desktop uses 6 for better accuracy

    const baseDt = 1000 / 60;
    const dt = baseDt / substeps;
    setInterval(() => {
      for (let i = 0; i < substeps; i++) {
        Matter.Engine.update(engine, dt * engine.timing.timeScale);
      }
    }, baseDt);

    // Resize handler.
    function resize() {
      const ratio = window.devicePixelRatio || 1;
      render.options.width = window.innerWidth;
      render.options.height = window.innerHeight;
      canvasEl.width = window.innerWidth * ratio;
      canvasEl.height = window.innerHeight * ratio;
      canvasEl.style.width = window.innerWidth + "px";
      canvasEl.style.height = window.innerHeight + "px";
      Matter.Render.setPixelRatio(render, ratio);
    }
    window.addEventListener("resize", resize);
    resize();

    // ---- Media Colliders ----
    // Create colliders for images, iframes, and video tags as triggers.
    window.BallFall.mediaColliders = [];
    function addMediaColliders() {
      document.querySelectorAll("img, iframe, video").forEach((el) => {
        if (el.id === "ball-spawner") return;
        const rect = el.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) return;
        const cx = rect.left + rect.width / 2 + window.scrollX;
        const cy = rect.top + rect.height / 2 + window.scrollY;
        const box = Bodies.rectangle(cx, cy, rect.width, rect.height, {
          isStatic: true,
          isSensor: true,
          render: { visible: false },
        });
        box.elRef = el;
        box.isMedia = true;
        window.BallFall.mediaColliders.push(box);
        World.add(engine.world, box);
      });
    }

    addMediaColliders();

    // ---- New Media Interaction Update ----
    // For each ball, if it overlaps a media collider, apply high drag and trigger a ripple once.
    function updateMediaInteractions() {
      const mediaColliders = window.BallFall.mediaColliders || [];
      const bodies = Composite.allBodies(engine.world);
      bodies.forEach((body) => {
        if (body.label === "BallFallBall") {
          let insideCollider = null;
          for (let collider of mediaColliders) {
            if (Matter.Bounds.contains(collider.bounds, body.position)) {
              insideCollider = collider;
              break;
            }
          }
          if (insideCollider) {
            if (body.frictionAir !== 0.1) {
              body.frictionAir = 0.1;
            }
            if (!body.inMedia) {
              body.inMedia = true;
              window.triggerMediaRipple(insideCollider, body);
            }
          } else {
            if (body.inMedia) {
              delete body.inMedia;
              body.frictionAir = 0;
            }
          }
        }
      });
    }

    // Hook media interaction update.
    Matter.Events.on(engine, "afterUpdate", updateMediaInteractions);

    // ---- Ball Spawning Logic ----
    const BALL_CATEGORY = 0x0002;
    const ballsList = [];
    let isAnimating = false;
    const totalFrames = 9;
    const frameDuration = 60;
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

    function spawnBall(initialValue, pos, originalBallsCompacted) {
      if (!window.BallFall.firstBallDropped) {
        window.BallFall.firstBallDropped = true;
        const dropIndicator = document.getElementById("spawner-indicator");
        if (dropIndicator) dropIndicator.style.display = "flex";
      }
      let delay = 300;
      if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
        delay = 0;
      } else if (!isAnimating) {
        playSpawnerAnimation();
      }
      setTimeout(() => {
        let spawnX, spawnY;
        if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
          spawnX = pos.x;
          spawnY = pos.y;
        } else {
          spawnX = window.scrollX + window.innerWidth / App.config.spawnX;
          spawnY = 55;
        }
        const ball = Bodies.circle(spawnX, spawnY, App.config.ballSize, {
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
          collisionFilter: { category: BALL_CATEGORY, mask: 0xffffffff },
        });
        // ← attach persistent properties
        ball.spawnTime = Date.now();
        ball.baseValue =
          typeof initialValue !== "undefined"
            ? initialValue
            : App.config.ballStartValue;
        ball.value = ball.baseValue;
        ball.originalBallsCompacted = originalBallsCompacted || 1;
        // ← schedule per-ball value increments
        ball._valueInterval = setInterval(() => {
          ball.value +=
            App.config.ballIncomeIncrement * (ball.originalBallsCompacted || 1);
        }, App.config.ballIncomeTimeStep);

        // disable immediate re-collision
        ball.collisionFilter.mask = 0xffffffff & ~BALL_CATEGORY;
        setTimeout(() => {
          ball.collisionFilter.mask = 0xffffffff;
        }, App.config.disableDuration);

        World.add(engine.world, ball);
        ballsList.push(ball);
      }, delay);
    }
    window.BallFall.spawnBall = spawnBall;

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

    function stopAutoSpawner() {
      if (spawnIntervalId) {
        clearInterval(spawnIntervalId);
        spawnIntervalId = null;
      }
    }
    window.BallFall.stopAutoSpawner = stopAutoSpawner;

    // ---- Removed Existing Collision Border Effect ----

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
      // Only run stillness check when the window is visible.
      if (document.visibilityState !== "visible") return;

      const bodies = Composite.allBodies(engine.world);
      bodies.forEach((body) => {
        if (body.label === "BallFallBall") {
          // Skip stillness check for balls younger than 5000ms
          if (Date.now() - (body.spawnTime || 0) < 5000) return;
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
          ) {
            prev.stillCount++;
          } else {
            prev.stillCount = 0;
          }
          prev.x = body.position.x;
          prev.y = body.position.y;
          if (prev.stillCount >= App.config.sitStillDeleteSeconds) {
            if (typeof window.glitchAndRemove === "function") {
              window.glitchAndRemove(body);
            } else {
              World.remove(engine.world, body);
            }
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

    // ---- Color Interpolation Functions (unchanged) ----
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
        h = s = 0;
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

    function interpolateColorHSL(color1, color2, t) {
      var hsl1 = hexToHSL(color1);
      var hsl2 = hexToHSL(color2);
      var deltaH = hsl2.h - hsl1.h;
      if (Math.abs(deltaH) > 0.5) {
        if (deltaH > 0) {
          deltaH -= 1;
        } else {
          deltaH += 1;
        }
      }
      var h = (hsl1.h + deltaH * t) % 1;
      if (h < 0) h += 1;
      var s = hsl1.s + (hsl2.s - hsl1.s) * t;
      var l = hsl1.l + (hsl2.l - hsl1.l) * t;
      return HSLToHex(h, s, l);
    }

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

    // ---- After Render Hook: update ball colors and render numbers. ----
    Events.on(render, "afterRender", function () {
      const context = render.context;
      Matter.Render.startViewTransform(render);
      const bodies = Composite.allBodies(engine.world);

      bodies.forEach((body) => {
        if (body.label === "BallFallBall") {
          const ballValue = body.value || 0;
          if (ballValue !== body.lastBallValue) {
            body.render.fillStyle = getBallColor(ballValue);
            body.lastBallValue = ballValue;
          }
          context.save();

          const fontSize =
            ballValue < 100
              ? 10
              : ballValue < 1000
              ? 7
              : ballValue < 10000
              ? 6
              : 4;

          context.font = `bold ${fontSize}px Consolas`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          // if (ballValue >= 100) {
          //   // draw white outline
          //   context.lineWidth = 1;
          //   context.strokeStyle = "#ffffff";
          //   context.strokeText(ballValue, body.position.x, body.position.y);
          // }  //How we do stroke
          if (ballValue >= 250) {
            // draw white fill
            context.fillStyle = "#ffffff";
          } else {
            // draw black fill
            context.fillStyle = "#1f1b0a";
          }
          context.fillText(ballValue, body.position.x, body.position.y);
          context.restore();
        }
      });

      Matter.Render.endViewTransform(render);
    });

    /* ---- Set custom surface restitution - this is needed because lines are isStatic true ---- */
    function patchRestitution(event) {
      event.pairs.forEach((pair) => {
        const { bodyA: a, bodyB: b } = pair;
        let other;

        if (a.label === "BallFallBall") {
          other = b;
        } else if (b.label === "BallFallBall") {
          other = a;
        } else {
          return;
        }

        pair.restitution = other.label === "CurvedLine" ? 0.35 : 0.95;
      });
    }

    Matter.Events.on(engine, "collisionStart", patchRestitution);
    Matter.Events.on(engine, "collisionActive", patchRestitution);
    /* --------------------------------------------------------- */

    console.log("Base module initialized, dispatching BallFallBaseReady");
    window.dispatchEvent(new Event("BallFallBaseReady"));
  }
  return { init };
})();

App.modules.text = (function () {
  function runTextModule() {
    if (window.innerWidth < 620) {
      // We don't build colliders for text on mobile, because there isn't enough width regardless of having enough resources
      // Still fire the event, even on mobile
      window.dispatchEvent(new Event("BallFallTextReady"));
      return;
    }

    const { engine, world } = window.BallFall || {};
    const off = document.createElement("canvas");
    const ctx = off.getContext("2d");

    if (!engine || !world) return;

    const Bodies = Matter.Bodies;
    const World = Matter.World;
    const Events = Matter.Events;

    function traceOutline(alphaData, w, h) {
      // find the first (top) row that has any opaque pixel
      let topRow = -1;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (alphaData[y * w + x] > 0) {
            topRow = y;
            break;
          }
        }
        if (topRow !== -1) break;
      }
      if (topRow === -1) return [];

      // find leftmost and rightmost x on that top row
      let leftTop = w,
        rightTop = -1;
      for (let x = 0; x < w; x++) {
        if (alphaData[topRow * w + x] > 0) {
          leftTop = Math.min(leftTop, x);
          rightTop = Math.max(rightTop, x);
        }
      }

      // find the last (bottom) row that has any opaque pixel
      let bottomRow = -1;
      for (let y = h - 1; y >= 0; y--) {
        for (let x = 0; x < w; x++) {
          if (alphaData[y * w + x] > 0) {
            bottomRow = y;
            break;
          }
        }
        if (bottomRow !== -1) break;
      }

      // find leftmost and rightmost x on that bottom row
      let leftBot = w,
        rightBot = -1;
      for (let x = 0; x < w; x++) {
        if (alphaData[bottomRow * w + x] > 0) {
          leftBot = Math.min(leftBot, x);
          rightBot = Math.max(rightBot, x);
        }
      }

      // build the triangle: top-left, top-right, and bottom-center
      const bottomCenter = (leftBot + rightBot) / 2;
      return [
        { x: leftTop, y: topRow },
        { x: rightTop, y: topRow },
        { x: bottomCenter, y: bottomRow },
      ];
    }

    // Shifts each point inward by a fixed distance from the shape’s center
    function shrinkEdges(localPts, dist) {
      return localPts.map((pt) => {
        const length = Math.hypot(pt.x, pt.y);
        if (length <= dist) {
          // If already very close to center, collapse it
          return { x: 0, y: 0 };
        }
        const s = (length - dist) / length;
        return { x: pt.x * s, y: pt.y * s };
      });
    }

    const shapeCache = new Map();

    function getCachedEdges(char, font, w, h) {
      const key = `${char}|${font}|${w}x${h}`;
      if (shapeCache.has(key)) {
        return shapeCache.get(key);
      }

      // draw the character once into an offscreen canvas
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const ctx = off.getContext("2d");
      ctx.clearRect(0, 0, w, h);
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#000";
      ctx.fillText(char, 0, 0);

      // extract alpha channel
      const data = ctx.getImageData(0, 0, w, h).data;
      const alphaData = new Uint8Array(w * h);
      for (let i = 3, j = 0; i < data.length; i += 4, j++) {
        alphaData[j] = data[i];
      }

      // compute the 3-point outline
      const raw = traceOutline(alphaData, w, h);
      if (!raw.length) {
        shapeCache.set(key, []);
        return [];
      }

      // center points around canvas midpoint
      const cx = w / 2,
        cy = h / 2;
      const local = raw.map((pt) => ({
        x: pt.x - cx,
        y: pt.y - cy,
      }));

      shapeCache.set(key, local);
      return local;
    }

    function wrapTextNodes(root) {
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );
      const textNodes = [];
      while (walker.nextNode()) {
        let node = walker.currentNode;
        if (
          node.nodeValue.trim() &&
          node.parentNode &&
          !node.parentNode.closest("#ballfall-ui") && // Skip UI Elements
          !["SCRIPT", "STYLE"].includes(node.parentNode.tagName)
        ) {
          textNodes.push(node);
        }
      }
      textNodes.forEach((node) => {
        const text = node.nodeValue;
        if (!text.trim()) return;
        const parent = node.parentNode;
        if (!parent || ["SCRIPT", "STYLE"].includes(parent.tagName)) return;
        const frag = document.createDocumentFragment();
        for (let char of text) {
          const span = document.createElement("span");
          span.textContent = char;
          frag.appendChild(span);
        }
        parent.replaceChild(frag, node);
      });
    }
    wrapTextNodes(document.body);

    function letterToBody(letterEl) {
      if (letterEl.tagName === "IMG" && letterEl.closest("#ballfall-ui")) {
        return null;
      }
      const rect = letterEl.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return null;

      // compute canvas size
      const w = Math.ceil(rect.width * 0.8);
      const h = Math.ceil(rect.height * 0.8);
      if (w < 1 || h < 1) return null;

      // get or build the collider once per unique char/font/size
      const font = window.getComputedStyle(letterEl).font;
      const verts = getCachedEdges(letterEl.textContent, font, w, h);
      if (!verts.length) return null;

      // position at element center
      const centerX = rect.left + window.scrollX + rect.width / 2;
      const centerY = rect.top + window.scrollY + rect.height / 2;

      const body = Bodies.fromVertices(
        centerX,
        centerY,
        [verts],
        { isStatic: true, render: { visible: true } },
        true
      );
      if (body) {
        body.elRef = letterEl;
        if (letterEl.closest("h1, h2, h3, h4, h5, h6")) {
          body.isHeader = true;
        }
      }
      return body;
    }

    // after wrapTextNodes(document.body);

    const elements = Array.from(document.querySelectorAll("span, img")).filter(
      (el) => !el.closest("#ballfall-ui")
    );

    let charCount = 0;
    const THRESHOLD = 6000;
    const deferred = [];

    // first pass: individual triangle bodies up to THRESHOLD
    elements.forEach((el) => {
      if (charCount < THRESHOLD) {
        const body = letterToBody(el);
        if (body) {
          World.add(world, body);
          charCount++;
        }
      } else {
        deferred.push(el);
      }
    });

    // … after your first-pass loop that fills `deferred` …

    // second pass: batch the rest by paragraph (parentNode)
    if (deferred.length) {
      const groups = new Map();
      deferred.forEach((el) => {
        const parent = el.parentNode;
        if (!groups.has(parent)) groups.set(parent, []);
        groups.get(parent).push(el);
      });

      groups.forEach((els, parent) => {
        const r = parent.getBoundingClientRect();
        const width = r.right - r.left;
        const height = r.bottom - r.top;
        const centerX = r.left + width / 2 + window.scrollX;
        const centerY = r.top + height / 2 + window.scrollY;

        const batchBody = Bodies.rectangle(centerX, centerY, width, height, {
          isStatic: true,
          render: { visible: true },
        });
        World.add(world, batchBody);
      });
    }

    // Helper: change the text color to match the ball's color.
    // Additionally, if the letter element is an <a> tag (or within one), boost the ball's speed by multiplying it by 1.5.
    function applyBallHitEffect(letterBody, ballBody) {
      const letterEl = letterBody.elRef;
      if (!letterEl) return;
      const ballColor =
        ballBody.render && ballBody.render.fillStyle
          ? ballBody.render.fillStyle
          : App.config.textHitColor;
      letterEl.style.color = ballColor;
      if (
        letterEl.tagName.toUpperCase() === "A" ||
        (letterEl.closest && letterEl.closest("a"))
      ) {
        const currentVelocity = ballBody.velocity;
        // Accelerate the ball.
        setTimeout(() => {
          const newVelocity = {
            x: currentVelocity.x * 1.1,
            y: currentVelocity.y * 1.1,
          };
          Matter.Body.setVelocity(ballBody, newVelocity);
        }, 0);
        // Trigger the motion blur trail effect.
        if (typeof window.applyLinkBounceEffect === "function") {
          window.applyLinkBounceEffect(ballBody);
        }
      }
    }

    // Collision handler: detect collisions between text letters and balls.
    Events.on(engine, "collisionStart", (evt) => {
      evt.pairs.forEach((pair) => {
        if (
          pair.bodyA.elRef &&
          pair.bodyA.elRef.tagName &&
          pair.bodyA.elRef.tagName.toUpperCase() === "SPAN" &&
          pair.bodyB.label === "BallFallBall"
        ) {
          applyBallHitEffect(pair.bodyA, pair.bodyB);
        } else if (
          pair.bodyB.elRef &&
          pair.bodyB.elRef.tagName &&
          pair.bodyB.elRef.tagName.toUpperCase() === "SPAN" &&
          pair.bodyA.label === "BallFallBall"
        ) {
          applyBallHitEffect(pair.bodyB, pair.bodyA);
        }
      });
    });

    window.dispatchEvent(new Event("BallFallTextReady"));
  }
  function init() {
    if (window.BallFall && window.BallFall.engine) {
      runTextModule();
    } else {
      window.addEventListener("BallFallBaseReady", runTextModule);
    }
  }
  return { init };
})();

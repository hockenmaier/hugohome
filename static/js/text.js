App.modules.text = (function () {
  function runTextModule() {
    if (window.innerWidth < 720) {
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
      const edges = [];
      function alphaAt(x, y) {
        if (x < 0 || y < 0 || x >= w || y >= h) return 0;
        return alphaData[y * w + x];
      }
      for (let y = 0; y < h - 1; y++) {
        for (let x = 0; x < w - 1; x++) {
          const topLeft = alphaAt(x, y);
          const topRight = alphaAt(x + 1, y);
          const bottomLeft = alphaAt(x, y + 1);
          const bottomRight = alphaAt(x + 1, y + 1);
          const squareIdx =
            (topLeft > 0 ? 8 : 0) +
            (topRight > 0 ? 4 : 0) +
            (bottomRight > 0 ? 2 : 0) +
            (bottomLeft > 0 ? 1 : 0);

          if (squareIdx === 1 || squareIdx === 14)
            edges.push({ x, y: y + 0.5 }, { x: x + 0.5, y: y + 1 });
          else if (squareIdx === 2 || squareIdx === 13)
            edges.push({ x: x + 0.5, y: y + 1 }, { x: x + 1, y: y + 0.5 });
          else if (squareIdx === 4 || squareIdx === 11)
            edges.push({ x: x + 0.5, y }, { x: x + 1, y: y + 0.5 });
          else if (squareIdx === 8 || squareIdx === 7)
            edges.push({ x, y: y + 0.5 }, { x: x + 0.5, y });
          else if (squareIdx === 3 || squareIdx === 12)
            edges.push({ x, y: y + 0.5 }, { x: x + 1, y: y + 0.5 });
          else if (squareIdx === 6 || squareIdx === 9)
            edges.push({ x: x + 0.5, y }, { x: x + 0.5, y: y + 1 });
        }
      }
      return edges;
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

    function getCachedEdges(char, font, w, h, alphaData) {
      const key = `${char}|${font}|${w}x${h}`;
      if (shapeCache.has(key)) return shapeCache.get(key);
      const raw = traceOutline(alphaData, w, h);
      if (!raw.length) {
        shapeCache.set(key, []);
        return [];
      }
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      for (const pt of raw) {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      }
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      const local = raw.map((pt) => ({ x: pt.x - cx, y: pt.y - cy }));
      const shrunk = shrinkEdges(local, 4);
      shapeCache.set(key, shrunk);
      return shrunk;
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
      if (letterEl.tagName === "IMG" && letterEl.closest("#ballfall-ui"))
        return null;
      const rect = letterEl.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return null;

      const off = document.createElement("canvas");
      off.width = Math.ceil(rect.width * 0.8);
      off.height = Math.ceil(rect.height * 0.8);
      ctx.font = window.getComputedStyle(letterEl).font;
      ctx.clearRect(0, 0, off.width, off.height);
      ctx.fillStyle = "#000";
      ctx.textBaseline = "top";
      ctx.fillText(letterEl.textContent, 0, 0);

      const imgData = ctx.getImageData(0, 0, off.width, off.height).data;
      const alphaData = [];
      for (let i = 3; i < imgData.length; i += 4) alphaData.push(imgData[i]);

      const shrunk = getCachedEdges(
        letterEl.textContent,
        ctx.font,
        off.width,
        off.height,
        alphaData
      );
      if (!shrunk.length) return null;

      const centerX = rect.left + window.scrollX + rect.width / 2;
      const centerY = rect.top + window.scrollY + rect.height / 2;
      const body = Bodies.fromVertices(
        centerX,
        centerY,
        [shrunk],
        { isStatic: true, render: { visible: false } },
        true
      );
      if (body) body.elRef = letterEl;
      return body;
    }

    const elements = Array.from(document.querySelectorAll("span, img")).filter(
      (el) => !el.closest("#ballfall-ui")
    );

    elements.forEach((el) => {
      const body = letterToBody(el);
      if (body) World.add(world, body);
    });

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

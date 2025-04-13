/* extra-effects.js
 * Provides additional visual effects:
 * - Motion blur trail for hyperlink bounce.
 * - Glitch distortion animation for balls that sit still.
 * - Ripple effect for ball collisions with media (images/iframes).
 */
(function () {
  // Create (or reuse) an overlay container for our effect elements.
  let effectContainer = document.getElementById("effect-container");
  if (!effectContainer) {
    effectContainer = document.createElement("div");
    effectContainer.id = "effect-container";
    effectContainer.style.position = "absolute";
    effectContainer.style.top = "0";
    effectContainer.style.left = "0";
    effectContainer.style.width = "100%";
    effectContainer.style.height = "100%";
    effectContainer.style.pointerEvents = "none";
    document.body.appendChild(effectContainer);
  }

  // Motion blur effect for hyperlink bounce.
  window.applyLinkBounceEffect = function (ball) {
    const duration = 200; // total duration in ms
    const interval = 30; // capture interval in ms
    const iterations = duration / interval;
    let count = 0;
    const radius = ball.circleRadius || App.config.ballSize;
    const color = ball.render.fillStyle || "#e6e6e6";

    const trailInterval = setInterval(() => {
      // Create a ghost element at the ball's current position.
      const ghost = document.createElement("div");
      ghost.style.position = "absolute";
      ghost.style.width = radius * 2 + "px";
      ghost.style.height = radius * 2 + "px";
      ghost.style.borderRadius = "50%";
      ghost.style.backgroundColor = color;
      ghost.style.left = ball.position.x - radius + "px";
      ghost.style.top = ball.position.y - radius + "px";
      ghost.style.opacity = "0.5";
      ghost.style.transition = `opacity ${duration}ms linear, transform ${duration}ms linear`;
      effectContainer.appendChild(ghost);
      // Start the fade/scale-out.
      requestAnimationFrame(() => {
        ghost.style.opacity = "0";
        ghost.style.transform = "scale(1.5)";
      });
      // Remove the ghost after the duration.
      setTimeout(() => {
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
      }, duration);
      count++;
      if (count >= iterations) clearInterval(trailInterval);
    }, interval);
  };
  // Revised glitch effect: break the ball into jagged fragments.
  window.glitchAndRemove = function (ball) {
    const fragmentCount = 6;
    const duration = 500; // total duration in ms for fragments to fade.
    const radius = ball.circleRadius || App.config.ballSize;
    const canvas = document.getElementById("ballfallCanvas");
    const canvasRect = canvas.getBoundingClientRect();
    const ballX = canvasRect.left + ball.position.x;
    const ballY = canvasRect.top + ball.position.y;
    const color = ball.render.fillStyle || "#e6e6e6";

    // Remove the ball from the physics world immediately.
    if (window.BallFall && window.BallFall.world) {
      Matter.World.remove(window.BallFall.world, ball);
    }

    // Generate random jagged polygon clip-path string.
    function randomJaggedPolygon() {
      // Generate between 5 and 8 points.
      const pointCount = Math.floor(Math.random() * 4) + 5;
      let points = [];
      for (let i = 0; i < pointCount; i++) {
        const angle = (i / pointCount) * 360;
        // Random radius between 60% and 100% of the ball radius.
        const r = Math.random() * 0.4 + 0.6;
        const x = 50 + r * 50 * Math.cos((angle * Math.PI) / 180);
        const y = 50 + r * 50 * Math.sin((angle * Math.PI) / 180);
        points.push(`${x}% ${y}%`);
      }
      return `polygon(${points.join(",")})`;
    }

    // Create and animate fragments.
    for (let i = 0; i < fragmentCount; i++) {
      const frag = document.createElement("div");
      frag.style.position = "absolute";
      frag.style.width = radius * 3 + "px";
      frag.style.height = radius * 3 + "px";
      frag.style.left = ballX - radius + "px";
      frag.style.top = ballY - radius + "px";
      frag.style.backgroundColor = color;
      // Remove circular shape so we can use a jagged clip-path.
      frag.style.borderRadius = "0";
      frag.style.clipPath = randomJaggedPolygon();
      frag.style.opacity = "1";
      frag.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
      effectContainer.appendChild(frag);

      // Calculate random outward motion and rotation.
      const offsetX = (Math.random() - 0.5) * radius * 4;
      const offsetY = (Math.random() - 0.5) * radius * 4;
      const rotateDeg = (Math.random() - 0.5) * 180;

      requestAnimationFrame(() => {
        frag.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotateDeg}deg) scale(0.5)`;
        frag.style.opacity = "0";
      });

      setTimeout(() => {
        if (frag.parentNode) frag.parentNode.removeChild(frag);
      }, duration);
    }
  };

  // Media ripple effect moved from base-simulation.js.
  window.triggerMediaRipple = function (collider, ball) {
    const ballColor =
      ball.render && ball.render.fillStyle
        ? ball.render.fillStyle
        : "rgba(0,0,255,0.5)";
    const ripple = document.createElement("div");
    ripple.className = "media-ripple";
    ripple.style.position = "absolute";
    ripple.style.width = "20px";
    ripple.style.height = "20px";
    ripple.style.border = "2px solid " + ballColor;
    ripple.style.borderRadius = "50%";
    ripple.style.pointerEvents = "none";
    ripple.style.opacity = "1";
    ripple.style.transition = "all 0.8s ease-out";
    ripple.style.zIndex = 9999;

    let target = collider.elRef;
    let container = target;
    let containerRect = target.getBoundingClientRect();

    // For images: wrap them so ripple fits exactly.
    if (target.tagName.toLowerCase() === "img") {
      if (
        !target.parentElement ||
        !target.parentElement.classList.contains("ripple-container")
      ) {
        const wrapper = document.createElement("div");
        wrapper.className = "ripple-container";
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";
        wrapper.style.width = containerRect.width + "px";
        wrapper.style.height = containerRect.height + "px";
        wrapper.style.overflow = "hidden";
        target.parentNode.insertBefore(wrapper, target);
        wrapper.appendChild(target);
        container = wrapper;
        containerRect = wrapper.getBoundingClientRect();
      } else {
        container = target.parentElement;
        containerRect = container.getBoundingClientRect();
      }
    }
    // For iframes: use parent element and ensure relative positioning.
    else if (target.tagName.toLowerCase() === "iframe") {
      container = target.parentElement;
      if (container && getComputedStyle(container).position === "static") {
        container.style.position = "relative";
      }
      containerRect = container.getBoundingClientRect();
    }

    // Compute ripple position relative to container.
    const relX = ball.position.x - containerRect.left - window.scrollX;
    const relY = ball.position.y - containerRect.top - window.scrollY;
    ripple.style.left = relX + "px";
    ripple.style.top = relY + "px";

    container.appendChild(ripple);
    // Force reflow and animate ripple.
    void ripple.offsetWidth;
    ripple.style.width = "60px";
    ripple.style.height = "60px";
    ripple.style.left = parseFloat(ripple.style.left) - 20 + "px";
    ripple.style.top = parseFloat(ripple.style.top) - 20 + "px";
    ripple.style.opacity = "0";
    setTimeout(() => {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 800);
  };
})();

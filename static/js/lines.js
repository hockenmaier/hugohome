App.modules.lines = (function () {
  let linesList = [];
  let mode = "straight"; // "straight", "curved", "none"

  function setMode(newMode) {
    mode = newMode;
    if (
      window.CurvedLineTool &&
      typeof window.CurvedLineTool.cancel === "function"
    ) {
      if (mode !== "curved") window.CurvedLineTool.cancel();
    }
    if (StraightLineTool && typeof StraightLineTool.cancel === "function") {
      if (mode !== "straight") StraightLineTool.cancel();
    }
  }
  function getMode() {
    return mode;
  }
  function addLine(body) {
    linesList.push(body);
  }
  function clearLines() {
    if (!window.BallFall || !window.BallFall.world) return;
    linesList.forEach((body) =>
      Matter.World.remove(window.BallFall.world, body)
    );
    linesList = [];
  }
  // Also attach clearLines on BallFall for UI access.
  if (window.BallFall) {
    window.BallFall.clearLines = clearLines;
  }

  const StraightLineTool = {
    state: 0, // 0: waiting for start, 1: waiting for end
    firstPoint: null,
    previewLine: null,
    onClick(x, y) {
      if (this.state === 0) {
        this.firstPoint = { x, y };
        this.state = 1;
      } else if (this.state === 1) {
        this.finish(x, y);
      }
    },
    onMove(x, y) {
      if (this.state !== 1) return;
      this.updatePreview(x, y);
    },
    updatePreview(x, y) {
      if (this.previewLine) {
        Matter.World.remove(window.BallFall.world, this.previewLine);
        this.previewLine = null;
      }
      const dx = x - this.firstPoint.x,
        dy = y - this.firstPoint.y,
        length = Math.sqrt(dx * dx + dy * dy),
        angle = Math.atan2(dy, dx),
        midX = (this.firstPoint.x + x) / 2,
        midY = (this.firstPoint.y + y) / 2;
      this.previewLine = Matter.Bodies.rectangle(
        midX,
        midY,
        length,
        App.config.lineThickness,
        {
          isStatic: true,
          angle: angle,
          render: {
            fillStyle: "rgba(149,110,255,0.5)",
            strokeStyle: "rgba(149,110,255,0.5)",
            lineWidth: 1,
          },
        }
      );
      Matter.World.add(window.BallFall.world, this.previewLine);
    },
    finish(x, y) {
      if (this.previewLine) {
        Matter.World.remove(window.BallFall.world, this.previewLine);
        this.previewLine = null;
      }
      const dx = x - this.firstPoint.x,
        dy = y - this.firstPoint.y,
        length = Math.sqrt(dx * dx + dy * dy),
        angle = Math.atan2(dy, dx),
        midX = (this.firstPoint.x + x) / 2,
        midY = (this.firstPoint.y + y) / 2;
      const lineBody = Matter.Bodies.rectangle(
        midX,
        midY,
        length,
        App.config.lineThickness,
        {
          isStatic: true,
          angle: angle,
          render: {
            fillStyle: "#956eff",
            strokeStyle: "#956eff",
            lineWidth: 1,
          },
        }
      );
      Matter.World.add(window.BallFall.world, lineBody);
      addLine(lineBody);
      this.state = 0;
      this.firstPoint = null;
    },
    cancel() {
      if (this.previewLine) {
        Matter.World.remove(window.BallFall.world, this.previewLine);
        this.previewLine = null;
      }
      this.state = 0;
      this.firstPoint = null;
    },
    onTouchStart(x, y) {
      this.onClick(x, y);
    },
    onTouchMove(x, y) {
      this.onMove(x, y);
    },
    onTouchEnd(x, y) {
      this.finish(x, y);
    },
  };

  function getLineAtPoint(x, y) {
    for (let body of linesList) {
      if (Matter.Vertices.contains(body.vertices, { x, y })) return body;
    }
    return null;
  }

  let hoveredLine = null;
  let pendingDeletionLine = null;
  let deletionTimer = null;
  let touchStartPos = null;

  function updatePulse() {
    const timeFactor = Date.now() / 200;
    const t = (Math.sin(timeFactor) + 1) / 2;
    if (hoveredLine) {
      let r = Math.round(149 + (255 - 149) * t);
      let g = Math.round(110 * (1 - t));
      let b = Math.round(255 * (1 - t));
      let color = `rgb(${r},${g},${b})`;
      hoveredLine.render.fillStyle = color;
      hoveredLine.render.strokeStyle = color;
    }
    if (pendingDeletionLine && pendingDeletionLine !== hoveredLine) {
      let r = Math.round(149 + (255 - 149) * t);
      let g = Math.round(110 * (1 - t));
      let b = Math.round(255 * (1 - t));
      let color = `rgb(${r},${g},${b})`;
      pendingDeletionLine.render.fillStyle = color;
      pendingDeletionLine.render.strokeStyle = color;
    }
    requestAnimationFrame(updatePulse);
  }
  updatePulse();

  // Desktop mouse events
  document.addEventListener("mousemove", (e) => {
    const mouseX = e.pageX - window.scrollX,
      mouseY = e.pageY - window.scrollY;
    if (mode === "straight" && StraightLineTool.state === 1) {
      StraightLineTool.onMove(mouseX, mouseY);
    } else if (mode === "curved") {
      if (
        window.CurvedLineTool &&
        typeof window.CurvedLineTool.onMove === "function"
      ) {
        window.CurvedLineTool.onMove(mouseX, mouseY);
      }
    }
    const line = getLineAtPoint(mouseX, mouseY);
    if (line) {
      if (hoveredLine !== line) {
        if (hoveredLine) {
          hoveredLine.render.fillStyle = "#956eff";
          hoveredLine.render.strokeStyle = "#956eff";
        }
        hoveredLine = line;
      }
      document.body.style.cursor = "pointer";
    } else {
      if (hoveredLine) {
        hoveredLine.render.fillStyle = "#956eff";
        hoveredLine.render.strokeStyle = "#956eff";
        hoveredLine = null;
      }
      document.body.style.cursor = "";
    }
  });

  document.addEventListener("contextmenu", (e) => {
    const mouseX = e.pageX - window.scrollX,
      mouseY = e.pageY - window.scrollY;
    if (
      (mode === "straight" && StraightLineTool.state === 1) ||
      (mode === "curved" &&
        window.CurvedLineTool &&
        window.CurvedLineTool.state !== 0)
    ) {
      if (mode === "straight") StraightLineTool.cancel();
      else if (mode === "curved" && window.CurvedLineTool)
        window.CurvedLineTool.cancel();
      e.preventDefault();
      return;
    }
    const line = getLineAtPoint(mouseX, mouseY);
    if (line) {
      Matter.World.remove(window.BallFall.world, line);
      const idx = linesList.indexOf(line);
      if (idx !== -1) linesList.splice(idx, 1);
      e.preventDefault();
    }
  });

  // Desktop click events (ignore on mobile)
  document.addEventListener("click", (e) => {
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
      return;
    if (e.target.closest("a, button, input, textarea, select, label")) return;
    if (mode === "none") return;
    const clickX = e.pageX - window.scrollX,
      clickY = e.pageY - window.scrollY;
    if (mode === "straight") {
      StraightLineTool.onClick(clickX, clickY);
    } else if (mode === "curved") {
      if (
        window.CurvedLineTool &&
        typeof window.CurvedLineTool.onClick === "function"
      ) {
        window.CurvedLineTool.onClick(clickX, clickY);
      }
    }
  });

  // Mobile touch events
  document.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0],
      touchX = touch.pageX - window.scrollX,
      touchY = touch.pageY - window.scrollY;
    const line = getLineAtPoint(touchX, touchY);
    if (line) {
      touchStartPos = { x: touchX, y: touchY };
      pendingDeletionLine = line;
      deletionTimer = setTimeout(() => {
        Matter.World.remove(window.BallFall.world, line);
        const idx = linesList.indexOf(line);
        if (idx !== -1) linesList.splice(idx, 1);
        pendingDeletionLine = null;
      }, App.config.lineDeleteMobileHold);
    } else {
      if (mode === "straight") {
        if (StraightLineTool.onTouchStart)
          StraightLineTool.onTouchStart(touchX, touchY);
      } else if (mode === "curved") {
        if (
          window.CurvedLineTool &&
          typeof window.CurvedLineTool.onTouchStart === "function"
        ) {
          window.CurvedLineTool.onTouchStart(touchX, touchY);
        }
      }
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0],
      touchX = touch.pageX - window.scrollX,
      touchY = touch.pageY - window.scrollY;
    if (mode === "straight" && StraightLineTool.state === 1) {
      if (StraightLineTool.onTouchMove)
        StraightLineTool.onTouchMove(touchX, touchY);
    } else if (mode === "curved") {
      if (
        window.CurvedLineTool &&
        typeof window.CurvedLineTool.onTouchMove === "function"
      ) {
        window.CurvedLineTool.onTouchMove(touchX, touchY);
      }
    }
    if (touchStartPos) {
      const dx = touchX - touchStartPos.x,
        dy = touchY - touchStartPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        clearTimeout(deletionTimer);
        deletionTimer = null;
        if (pendingDeletionLine) {
          pendingDeletionLine.render.fillStyle = "#956eff";
          pendingDeletionLine.render.strokeStyle = "#956eff";
        }
        pendingDeletionLine = null;
        touchStartPos = null;
      }
    }
  });

  document.addEventListener("touchend", (e) => {
    if (mode === "straight" && StraightLineTool.state === 1) {
      const touch = e.changedTouches[0],
        touchX = touch.pageX - window.scrollX,
        touchY = touch.pageY - window.scrollY,
        dx = touchX - StraightLineTool.firstPoint.x,
        dy = touchY - StraightLineTool.firstPoint.y;
      if (Math.sqrt(dx * dx + dy * dy) < 7) {
        StraightLineTool.cancel();
      } else {
        StraightLineTool.onTouchEnd(touchX, touchY);
      }
    }
    if (mode === "curved") {
      if (
        window.CurvedLineTool &&
        typeof window.CurvedLineTool.onTouchEnd === "function"
      ) {
        const touch = e.changedTouches[0],
          touchX = touch.pageX - window.scrollX,
          touchY = touch.pageY - window.scrollY;
        window.CurvedLineTool.onTouchEnd(touchX, touchY);
      }
    }
    if (pendingDeletionLine) {
      clearTimeout(deletionTimer);
      deletionTimer = null;
      pendingDeletionLine.render.fillStyle = "#956eff";
      pendingDeletionLine.render.strokeStyle = "#956eff";
      pendingDeletionLine = null;
      touchStartPos = null;
    }
  });

  function init() {
    if (window.BallFall && window.BallFall.engine) {
      // Ready.
    } else {
      window.addEventListener("BallFallBaseReady", function () {});
    }
  }

  return {
    init,
    setMode,
    getMode,
    addLine,
    clearLines,
  };
})();

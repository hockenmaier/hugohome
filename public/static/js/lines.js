// This is the base class for all of the "drawn powerups" which range from a simple line to a launcher cannon.
// This should always control all of the mouse and touch events rather than subclasses handling those themselves, so that they only need to be edited one place.
App.modules.lines = (function () {
  let mode = "straight";

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
    if (
      window.LauncherCreateTool &&
      typeof LauncherCreateTool.cancel === "function"
    ) {
      if (mode !== "launcher") LauncherCreateTool.cancel();
    }
  }
  function getMode() {
    return mode;
  }
  function addLine(body) {
    body.isLine = true;
  }

  function getLineAtPoint(x, y) {
    const point = { x, y };
    const bodies = Matter.Composite.allBodies(window.BallFall.world);
    for (let body of bodies) {
      if (body.isLine) {
        if (body.label === "CurvedLine" || body.label === "Launcher") {
          for (let part of body.parts) {
            if (Matter.Vertices.contains(part.vertices, point)) return body;
          }
        } else if (body.parts && body.parts.length > 1) {
          for (let i = 1; i < body.parts.length; i++) {
            if (Matter.Vertices.contains(body.parts[i].vertices, point))
              return body;
          }
        } else {
          if (Matter.Vertices.contains(body.vertices, point)) return body;
        }
      }
    }
    return null;
  }

  let hoveredLine = null;
  let pendingDeletionLine = null;
  let deletionTimer = null;
  let touchStartPos = null;

  // Reset a line's style to default.
  function resetLine(body) {
    if (!body) return;
    if (body.label === "Launcher" && body.render) {
      if (body.render.sprite) {
        body.render.sprite.opacity = 1;
      }
      body.render.opacity = 1;
    }
    if (body.parts && body.parts.length > 1) {
      body.parts.forEach((part) => {
        part.render.fillStyle = "#956eff";
        part.render.strokeStyle = "#956eff";
      });
    } else if (body.render) {
      body.render.fillStyle = "#956eff";
      body.render.strokeStyle = "#956eff";
    }
  }

  let lastHovered = null;
  let hoveredLineStartTime = null;
  let pendingDeletionLineStartTime = null;

  function updatePulse() {
    function applyPulse(body, opacity) {
      if (body.label === "Launcher" && body.render && body.render.sprite) {
        body.render.sprite.opacity = opacity;
        body.render.opacity = opacity;
      } else if (body.parts && body.parts.length > 1) {
        body.parts.forEach((part) => {
          part.render.opacity = opacity;
        });
      } else if (body.render) {
        body.render.opacity = opacity;
      }
    }

    function reset(body) {
      if (body.label === "Launcher" && body.render && body.render.sprite) {
        body.render.sprite.opacity = 1;
        body.render.opacity = 1;
      } else if (body.parts && body.parts.length > 1) {
        body.parts.forEach((part) => {
          part.render.opacity = 1;
        });
      } else if (body.render) {
        body.render.opacity = 1;
      }
    }

    if (hoveredLine) {
      if (!hoveredLineStartTime) hoveredLineStartTime = Date.now();
      const elapsed = Date.now() - hoveredLineStartTime;
      // Add π/2 so that at elapsed = 0 the sine is at its maximum (1)
      const t = (Math.sin(elapsed / 75 + Math.PI / 2) + 1) / 2;
      const opacity = 0.2 + 0.8 * t;
      applyPulse(hoveredLine, opacity);
      lastHovered = hoveredLine;
    } else if (lastHovered) {
      reset(lastHovered);
      lastHovered = null;
      hoveredLineStartTime = null;
    }

    if (pendingDeletionLine && pendingDeletionLine !== hoveredLine) {
      if (!pendingDeletionLineStartTime)
        pendingDeletionLineStartTime = Date.now();
      const elapsed = Date.now() - pendingDeletionLineStartTime;
      const t = (Math.sin(elapsed / 75 + Math.PI / 2) + 1) / 2;
      const opacity = 0.2 + 0.8 * t;
      applyPulse(pendingDeletionLine, opacity);
    } else {
      pendingDeletionLineStartTime = null;
    }

    requestAnimationFrame(updatePulse);
  }

  updatePulse();

  const StraightLineTool = {
    state: 0, // 0: waiting for start, 1: waiting for end
    firstPoint: null,
    previewLine: null,
    onClick(x, y) {
      if (this.state === 0) {
        this.firstPoint = { x, y };
        this.state = 1;
      } else {
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

  // Desktop mouse events
  document.addEventListener("mousemove", (e) => {
    const mouseX = e.pageX - window.scrollX,
      mouseY = e.pageY - window.scrollY;
    if (mode === "straight" && StraightLineTool.state === 1) {
      StraightLineTool.onMove(mouseX, mouseY);
    } else if (
      mode === "curved" &&
      window.CurvedLineTool &&
      typeof window.CurvedLineTool.onMove === "function"
    ) {
      window.CurvedLineTool.onMove(mouseX, mouseY);
    } else if (
      mode === "launcher" &&
      window.LauncherCreateTool &&
      LauncherCreateTool.state === 1
    ) {
      LauncherCreateTool.onMove(mouseX, mouseY);
    }
    const line = getLineAtPoint(mouseX, mouseY);
    if (line) {
      if (hoveredLine !== line) {
        if (hoveredLine) {
          resetLine(hoveredLine);
        }
        hoveredLine = line;
      }
      document.body.style.cursor = "pointer";
    } else {
      if (hoveredLine) {
        resetLine(hoveredLine);
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
        window.CurvedLineTool.state !== 0) ||
      (mode === "launcher" &&
        window.LauncherCreateTool &&
        LauncherCreateTool.state !== 0)
    ) {
      if (mode === "straight") StraightLineTool.cancel();
      else if (mode === "curved" && window.CurvedLineTool)
        window.CurvedLineTool.cancel();
      else if (mode === "launcher" && window.LauncherCreateTool)
        LauncherCreateTool.cancel();
      e.preventDefault();
      return;
    }
    const line = getLineAtPoint(mouseX, mouseY);
    if (line) {
      Matter.World.remove(window.BallFall.world, line);
      e.preventDefault();
    }
  });

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
    } else if (mode === "launcher") {
      if (
        window.LauncherCreateTool &&
        typeof LauncherCreateTool.onClick === "function"
      ) {
        window.LauncherCreateTool.onClick(clickX, clickY);
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
      } else if (mode === "launcher") {
        if (
          window.LauncherCreateTool &&
          typeof LauncherCreateTool.onTouchStart === "function"
        ) {
          LauncherCreateTool.onTouchStart(touchX, touchY);
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
    } else if (mode === "launcher") {
      if (
        window.LauncherCreateTool &&
        typeof LauncherCreateTool.onTouchMove === "function"
      ) {
        LauncherCreateTool.onTouchMove(touchX, touchY);
      }
    }
    if (touchStartPos) {
      const dx = touchX - touchStartPos.x,
        dy = touchY - touchStartPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        clearTimeout(deletionTimer);
        deletionTimer = null;
        if (pendingDeletionLine) {
          resetLine(pendingDeletionLine);
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
    if (mode === "launcher") {
      if (
        window.LauncherCreateTool &&
        typeof LauncherCreateTool.onTouchEnd === "function"
      ) {
        const touch = e.changedTouches[0],
          touchX = touch.pageX - window.scrollX,
          touchY = touch.pageY - window.scrollY;
        LauncherCreateTool.onTouchEnd(touchX, touchY);
      }
    }
    if (pendingDeletionLine) {
      clearTimeout(deletionTimer);
      deletionTimer = null;
      resetLine(pendingDeletionLine);
      pendingDeletionLine = null;
      touchStartPos = null;
    }
  });

  function init() {
    if (window.BallFall && window.BallFall.engine) {
      /* Ready */
    } else {
      window.addEventListener("BallFallBaseReady", function () {});
    }
  }

  return { init, setMode, getMode, addLine };
})();

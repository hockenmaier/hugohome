// This is the base class for all of the "drawn powerups"
// (existing comments preserved)
App.modules.lines = (function () {
  let mode = "straight";

  function setMode(newMode) {
    mode = newMode;
    if (
      window.CurvedLineTool &&
      typeof window.CurvedLineTool.cancel === "function" &&
      mode !== "curved"
    )
      window.CurvedLineTool.cancel();
    if (
      StraightLineTool &&
      typeof StraightLineTool.cancel === "function" &&
      mode !== "straight"
    )
      StraightLineTool.cancel();
    if (
      window.LauncherCreateTool &&
      typeof LauncherCreateTool.cancel === "function" &&
      mode !== "launcher"
    )
      LauncherCreateTool.cancel();
    if (
      window.DottedLineTool &&
      typeof DottedLineTool.cancel === "function" &&
      mode !== "dotted"
    )
      DottedLineTool.cancel();

    // Lock scrolling on mobile when a drawing tool is active.
    if (window.innerWidth < 720) {
      if (newMode !== "none") {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
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
    if (!window.BallFall || !window.BallFall.world) return null;
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
      if (body.render.sprite) body.render.sprite.opacity = 1;
      body.render.opacity = 1;
    } else if (body.label === "DottedLine") {
      if (body.render) {
        body.render.fillStyle = "#a8328d";
        body.render.strokeStyle = "#a8328d";
        body.render.opacity = 1;
      }
    } else if (body.parts && body.parts.length > 1) {
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
  // Existing StraightLineTool definition remains unchanged...
  const StraightLineTool = {
    state: 0,
    firstPoint: null,
    previewLine: null,
    onClick(x, y) {
      const tool = new BaseDrawingTool("straight", App.config.costs.straight);
      if (!tool.canPlace()) {
        BaseDrawingTool.showInsufficientFunds();
        return;
      }
      if (this.state === 0) {
        this.firstPoint = { x, y };
        this.state = 1;
      } else {
        this.finish(x, y);
        tool.charge();
        // Save the placed line persistently
        if (App.savePlacedObjects) App.savePlacedObjects();
      }
    },

    onMove(x, y) {
      if (this.state !== 1) return;
      this.updatePreview(x, y);
    },
    updatePreview(x, y) {
      if (!window.BallFall || !window.BallFall.world) return;
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
      // Mark as a persistent, user-placed object.
      lineBody.isPersistent = true;
      if (
        window.App.modules.lines &&
        typeof window.App.modules.lines.addLine === "function"
      ) {
        window.App.modules.lines.addLine(lineBody);
      }
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
      new BaseDrawingTool("straight", App.config.costs.straight).charge();
      if (App.savePlacedObjects) App.savePlacedObjects();
    },
  };

  // Helper to get the current active tool based on mode.
  function getActiveTool() {
    switch (mode) {
      case "straight":
        return StraightLineTool;
      case "curved":
        return window.CurvedLineTool;
      case "launcher":
        return window.LauncherCreateTool;
      case "dotted":
        return window.DottedLineTool;
      default:
        return null;
    }
  }

  // Consolidated desktop event handlers.
  document.addEventListener("mousemove", (e) => {
    const mouseX = e.pageX,
      mouseY = e.pageY;
    let tool = getActiveTool();
    if (tool && typeof tool.onMove === "function") {
      tool.onMove(mouseX, mouseY);
    }
    const line = getLineAtPoint(mouseX, mouseY);
    if (line) {
      if (hoveredLine !== line) {
        if (hoveredLine) resetLine(hoveredLine);
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
    const mouseX = e.pageX,
      mouseY = e.pageY;
    let tool = getActiveTool();
    if (tool && tool.state && tool.state !== 0) {
      if (typeof tool.cancel === "function") tool.cancel();
      e.preventDefault();
      return;
    }
    const line = getLineAtPoint(mouseX, mouseY);
    if (line) {
      Matter.World.remove(window.BallFall.world, line);
      e.preventDefault();
    }
  });
  // Consolidated desktop event handlers.
  document.addEventListener(
    "click",
    (e) => {
      if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
        return;

      // Always ignore clicks from the toggle container.
      if (e.target.closest("#toggle-container")) return;

      const tool = getActiveTool();
      // Determine if the click originated from UI elements.
      const uiElement =
        e.target.closest("#ballfall-ui") ||
        e.target.closest("#spawner-container");

      const linkEl = e.target.closest("a");
      // If a link is clicked outside UI and a drawing tool is selected, always block and notify.
      if (linkEl && !uiElement && tool) {
        e.preventDefault();
        flashElementStyle(
          linkEl,
          ["color", "textDecoration"],
          { color: "red", textDecoration: "line-through" },
          100,
          6
        );
        const toggleGroup = document.getElementById("toggle-container");
        if (toggleGroup) {
          flashElementStyle(
            toggleGroup,
            ["border"],
            { border: "2px solid red" },
            100,
            6
          );
        }
      }

      // If the click is from a UI element and no drawing is in progress, do nothing.
      if (uiElement && (!tool || tool.state === 0)) {
        return;
      }

      const clickX = e.pageX,
        clickY = e.pageY;
      if (tool && typeof tool.onClick === "function") {
        tool.onClick(clickX, clickY);
      }
    },
    true
  );

  // Consolidated mobile touch events.
  document.addEventListener("touchstart", (e) => {
    if (e.target.closest("#ballfall-ui")) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0],
      touchX = touch.pageX,
      touchY = touch.pageY;
    const line = getLineAtPoint(touchX, touchY);
    if (line) {
      touchStartPos = { x: touchX, y: touchY };
      pendingDeletionLine = line;
      deletionTimer = setTimeout(() => {
        Matter.World.remove(window.BallFall.world, line);
        pendingDeletionLine = null;
      }, App.config.lineDeleteMobileHold);
    } else {
      let tool = getActiveTool();
      if (tool && typeof tool.onTouchStart === "function") {
        tool.onTouchStart(touchX, touchY);
      }
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (e.target.closest("#ballfall-ui")) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0],
      touchX = touch.pageX,
      touchY = touch.pageY;
    let tool = getActiveTool();
    if (tool && typeof tool.onTouchMove === "function") {
      tool.onTouchMove(touchX, touchY);
    }
    if (touchStartPos) {
      const dx = touchX - touchStartPos.x,
        dy = touchY - touchStartPos.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        clearTimeout(deletionTimer);
        deletionTimer = null;
        if (pendingDeletionLine) resetLine(pendingDeletionLine);
        pendingDeletionLine = null;
        touchStartPos = null;
      }
    }
  });

  document.addEventListener("touchend", (e) => {
    if (e.target.closest("#ballfall-ui")) return;
    const touch = e.changedTouches[0],
      touchX = touch.pageX,
      touchY = touch.pageY;
    let tool = getActiveTool();
    if (tool && typeof tool.onTouchEnd === "function") {
      tool.onTouchEnd(touchX, touchY);
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

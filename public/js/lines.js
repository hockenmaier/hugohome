(function () {
  function defineLinesModule() {
    const world = window.BallFall.world;
    const linesList = [];
    const Bodies = Matter.Bodies;
    const World = Matter.World;

    // --- State variables ---
    // For straight‑line drawing.
    let firstClick = null;
    let previewLine = null;
    // For deletion pulsing.
    let hoveredLine = null;
    let pendingDeletionLine = null;
    let deletionTimer = null;
    let touchStartPos = null;

    // currentMode: "straight", "curved", or null.
    // Default to null (no drawing) so that drawing happens only when a tool is selected.
    let currentMode = null;
    // Expose currentMode so external UI can toggle tools.
    window.App = window.App || {};
    window.App.modules = window.App.modules || {};
    window.App.modules.lines = {
      get currentMode() {
        return currentMode;
      },
      set currentMode(val) {
        currentMode = val;
      },
      get linesList() {
        return linesList;
      },
      init: function () {},
    };

    // --- Utility: Get event position (works for both touch and mouse) ---
    function getEventPos(e) {
      let touch;
      if (e.touches && e.touches.length) {
        touch = e.touches[0];
      } else if (e.changedTouches && e.changedTouches.length) {
        touch = e.changedTouches[0];
      } else {
        touch = e;
      }
      return {
        x: touch.pageX - window.scrollX,
        y: touch.pageY - window.scrollY,
      };
    }

    // --- Straight‑line drawing functions (from the old working version) ---
    function removePreview() {
      if (previewLine) {
        World.remove(world, previewLine);
        previewLine = null;
      }
    }

    function updatePreview(x, y) {
      if (!firstClick) return;
      removePreview();
      const dx = x - firstClick.x,
        dy = y - firstClick.y,
        length = Math.sqrt(dx * dx + dy * dy),
        angle = Math.atan2(dy, dx),
        midX = (firstClick.x + x) / 2,
        midY = (firstClick.y + y) / 2;
      previewLine = Bodies.rectangle(
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
      World.add(world, previewLine);
    }

    function createStraightLine(x, y) {
      removePreview();
      const dx = x - firstClick.x,
        dy = y - firstClick.y,
        length = Math.sqrt(dx * dx + dy * dy);
      if (length < 7) {
        firstClick = null;
        return;
      }
      const angle = Math.atan2(dy, dx),
        midX = (firstClick.x + x) / 2,
        midY = (firstClick.y + y) / 2;
      const lineBody = Bodies.rectangle(
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
      World.add(world, lineBody);
      linesList.push(lineBody);
      firstClick = null;
    }

    // --- Get a line at a given point ---
    function getLineAtPoint(x, y) {
      for (let body of linesList) {
        if (Matter.Vertices.contains(body.vertices, { x, y })) return body;
      }
      return null;
    }

    // --- Pulse effect for hovered and pending-deletion lines ---
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

    // --- Desktop Events ---
    document.addEventListener("mousemove", (e) => {
      const pos = getEventPos(e);
      // If drawing a straight line and a start point is set, update preview.
      if (currentMode === "straight" && firstClick) {
        updatePreview(pos.x, pos.y);
      }
      // Update hovered line for deletion pulse.
      const line = getLineAtPoint(pos.x, pos.y);
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
      // For curved tool, forward the onMove event.
      if (
        currentMode === "curved" &&
        window.CurvedLineTool &&
        typeof window.CurvedLineTool.onMove === "function"
      ) {
        window.CurvedLineTool.onMove(pos.x, pos.y);
      }
    });

    document.addEventListener("click", (e) => {
      if (e.target.closest("a, button, input, textarea, select, label")) return;
      const pos = getEventPos(e);
      if (currentMode === "straight") {
        if (!firstClick) {
          firstClick = { x: pos.x, y: pos.y };
        } else {
          createStraightLine(pos.x, pos.y);
        }
      } else if (
        currentMode === "curved" &&
        window.CurvedLineTool &&
        typeof window.CurvedLineTool.onClick === "function"
      ) {
        window.CurvedLineTool.onClick(pos.x, pos.y);
      }
    });

    document.addEventListener("contextmenu", (e) => {
      const pos = getEventPos(e);
      // Cancel in-progress straight-line drawing.
      if (firstClick) {
        removePreview();
        firstClick = null;
        e.preventDefault();
        return;
      }
      const line = getLineAtPoint(pos.x, pos.y);
      if (line) {
        World.remove(world, line);
        const idx = linesList.indexOf(line);
        if (idx !== -1) linesList.splice(idx, 1);
        e.preventDefault();
      }
    });

    // --- Mobile Touch Events ---
    document.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      const pos = getEventPos(e);
      const line = getLineAtPoint(pos.x, pos.y);
      if (line) {
        // Enter deletion mode.
        touchStartPos = pos;
        pendingDeletionLine = line;
        deletionTimer = setTimeout(() => {
          World.remove(world, line);
          const idx = linesList.indexOf(line);
          if (idx !== -1) linesList.splice(idx, 1);
          pendingDeletionLine = null;
        }, App.config.lineDeleteMobileHold);
      } else {
        if (currentMode === "straight") {
          firstClick = pos;
          updatePreview(pos.x, pos.y);
        } else if (
          currentMode === "curved" &&
          window.CurvedLineTool &&
          typeof window.CurvedLineTool.onClick === "function"
        ) {
          window.CurvedLineTool.onClick(pos.x, pos.y);
        }
      }
    });

    document.addEventListener("touchmove", (e) => {
      const pos = getEventPos(e);
      if (currentMode === "straight" && firstClick) {
        updatePreview(pos.x, pos.y);
      }
      if (touchStartPos) {
        const dx = pos.x - touchStartPos.x,
          dy = pos.y - touchStartPos.y;
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
      if (
        currentMode === "curved" &&
        window.CurvedLineTool &&
        typeof window.CurvedLineTool.onMove === "function"
      ) {
        window.CurvedLineTool.onMove(pos.x, pos.y);
      }
    });

    document.addEventListener("touchend", (e) => {
      const pos = getEventPos(e);
      if (currentMode === "straight" && firstClick) {
        createStraightLine(pos.x, pos.y);
      }
      if (pendingDeletionLine) {
        clearTimeout(deletionTimer);
        deletionTimer = null;
        pendingDeletionLine.render.fillStyle = "#956eff";
        pendingDeletionLine.render.strokeStyle = "#956eff";
        pendingDeletionLine = null;
        touchStartPos = null;
      }
      if (
        currentMode === "curved" &&
        window.CurvedLineTool &&
        typeof window.CurvedLineTool.finish === "function"
      ) {
        window.CurvedLineTool.finish(pos.x, pos.y);
      }
    });

    // Expose clearLines for your UI.
    window.BallFall.clearLines = function () {
      linesList.forEach((body) => World.remove(world, body));
      linesList.length = 0;
    };
  }

  if (window.BallFall && window.BallFall.world) {
    defineLinesModule();
  } else {
    window.addEventListener("BallFallBaseReady", defineLinesModule);
  }
})();

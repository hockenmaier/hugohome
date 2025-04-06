/* static/js/line-interaction.js */
/*
 * line-interaction.js
 * Provides hover pulse effects and deletion (right-click on desktop and hold on mobile)
 * for drawn line bodies.
 */
(function () {
  let hoveredLine = null;
  let pendingDeletionLine = null;
  let deletionTimer = null;
  let touchStartPos = null;
  let lastHovered = null;
  let hoveredLineStartTime = null;
  let pendingDeletionLineStartTime = null;

  // Improved hit detection: if compound, check each part (skipping parent if needed)
  function getLineAtPoint(x, y) {
    if (!window.BallFall || !window.BallFall.world) return null;
    const point = { x, y };
    const bodies = Matter.Composite.allBodies(window.BallFall.world);
    for (let body of bodies) {
      if (body.deleted) continue; // Skip removed bodies
      if (body.isLine) {
        if (body.parts && body.parts.length > 1) {
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

  function resetLine(body) {
    if (!body) return;
    if (body.label === "Launcher" && body.render) {
      if (body.render.sprite) body.render.sprite.opacity = 1;
      body.render.opacity = 1;
    } else if (body.label === "DottedLine") {
      if (body.render) {
        body.render.fillStyle =
          App.config.dottedLineRender.strokeStyle || "#a8328d";
        body.render.strokeStyle =
          App.config.dottedLineRender.strokeStyle || "#a8328d";
        body.render.opacity = 1;
      }
    } else if (body.parts && body.parts.length > 1) {
      body.parts.forEach((part) => {
        part.render.fillStyle =
          App.config.straightLineRender.fillStyle || "#956eff";
        part.render.strokeStyle =
          App.config.straightLineRender.strokeStyle || "#956eff";
        part.render.opacity = 1;
      });
    } else if (body.render) {
      body.render.fillStyle =
        App.config.straightLineRender.fillStyle || "#956eff";
      body.render.strokeStyle =
        App.config.straightLineRender.strokeStyle || "#956eff";
      body.render.opacity = 1;
    }
  }

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

  function updatePulse() {
    // Hovered line pulse
    if (hoveredLine) {
      if (!hoveredLineStartTime) hoveredLineStartTime = Date.now();
      const elapsed = Date.now() - hoveredLineStartTime;
      const t = (Math.sin(elapsed / 75 + Math.PI / 2) + 1) / 2;
      const opacity = 0.2 + 0.8 * t;
      applyPulse(hoveredLine, opacity);
      lastHovered = hoveredLine;
    } else if (lastHovered) {
      resetLine(lastHovered);
      lastHovered = null;
      hoveredLineStartTime = null;
    }
    // Pending deletion pulse
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

  // Desktop hover: update cursor and pulse the hovered line.
  document.addEventListener("mousemove", (e) => {
    const mouseX = e.pageX;
    const mouseY = e.pageY;
    const line = getLineAtPoint(mouseX, mouseY);
    if (line) {
      if (hoveredLine !== line) {
        if (hoveredLine) resetLine(hoveredLine);
        hoveredLine = line;
        hoveredLineStartTime = Date.now();
      }
      document.body.style.cursor = "pointer";
    } else {
      if (hoveredLine) {
        resetLine(hoveredLine);
        hoveredLine = null;
        hoveredLineStartTime = null;
      }
      document.body.style.cursor = "";
    }
  });

  // Desktop right-click deletion.
  document.addEventListener("contextmenu", (e) => {
    const mouseX = e.pageX;
    const mouseY = e.pageY;
    const tool =
      window.App.modules.lines && window.App.modules.lines.getMode
        ? window.App.modules.lines.getMode()
        : null;
    if (
      tool &&
      tool.state &&
      tool.state !== 0 &&
      typeof tool.cancel === "function"
    ) {
      tool.cancel();
      e.preventDefault();
      return;
    }
    const line = getLineAtPoint(mouseX, mouseY);
    if (line) {
      // Attempt removal via Matter – deep removal flag set.
      Matter.Composite.remove(window.BallFall.world, line, true);
      // Fallback: manually remove the body from the world's bodies array.
      const bodies = window.BallFall.world.bodies;
      const idx = bodies.indexOf(line);
      if (idx !== -1) {
        bodies.splice(idx, 1);
      }
      if (line.label === "Launcher") {
        if (line.persistenceId)
          App.Persistence.deleteLauncher(line.persistenceId);
      } else {
        if (line.persistenceId) App.Persistence.deleteLine(line.persistenceId);
      }
      e.preventDefault();
    }
  });

  // Mobile touch deletion.
  document.addEventListener("touchstart", (e) => {
    if (e.target.closest("#ballfall-ui")) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const touchX = touch.pageX;
    const touchY = touch.pageY;
    const line = getLineAtPoint(touchX, touchY);
    if (line) {
      touchStartPos = { x: touchX, y: touchY };
      pendingDeletionLine = line;
      deletionTimer = setTimeout(() => {
        Matter.World.remove(window.BallFall.world, line);
        if (line.label === "Launcher") {
          if (line.persistenceId)
            App.Persistence.deleteLauncher(line.persistenceId);
        } else {
          if (line.persistenceId)
            App.Persistence.deleteLine(line.persistenceId);
        }
        pendingDeletionLine = null;
      }, App.config.lineDeleteMobileHold);
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (e.target.closest("#ballfall-ui")) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const touchX = touch.pageX;
    const touchY = touch.pageY;
    if (touchStartPos) {
      const dx = touchX - touchStartPos.x;
      const dy = touchY - touchStartPos.y;
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
    if (pendingDeletionLine) {
      clearTimeout(deletionTimer);
      deletionTimer = null;
      resetLine(pendingDeletionLine);
      pendingDeletionLine = null;
      touchStartPos = null;
    }
  });
})();

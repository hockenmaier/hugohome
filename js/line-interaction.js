/* static/js/line-interaction.js */
/*
 * line-interaction.js
 * Provides hover pulse effects and deletion for drawn line bodies and compactors.
 * For compactors, all parts share the same persistenceId and are grouped together.
 */
(function () {
  // If target is a group (array) then apply a function to each
  function applyToGroup(target, fn) {
    if (Array.isArray(target)) {
      target.forEach(fn);
    } else {
      fn(target);
    }
  }

  function resetLine(target) {
    applyToGroup(target, function (body) {
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
        body.parts.forEach(function (part) {
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
    });
  }

  function applyPulse(target, opacity) {
    applyToGroup(target, function (body) {
      if (body.label === "Launcher" && body.render && body.render.sprite) {
        body.render.sprite.opacity = opacity;
        body.render.opacity = opacity;
      } else if (body.parts && body.parts.length > 1) {
        body.parts.forEach(function (part) {
          part.render.opacity = opacity;
        });
      } else if (body.render) {
        body.render.opacity = opacity;
      }
    });
  }

  // Modified getLineAtPoint: if the point is inside any compactor part,
  // return all bodies with that persistenceId.
  function getLineAtPoint(x, y) {
    if (!window.BallFall || !window.BallFall.world) return null;
    const point = { x, y };
    const bodies = Matter.Composite.allBodies(window.BallFall.world);
    // First check for any compactor part hit.
    for (let body of bodies) {
      if (body.isCompactor && body.persistenceId) {
        // Use the first part check.
        if (body.parts && body.parts.length > 1) {
          for (let i = 1; i < body.parts.length; i++) {
            if (Matter.Vertices.contains(body.parts[i].vertices, point)) {
              // Found one compactor hit.
              // Now group all bodies with the same persistenceId.
              return bodies.filter(
                (b) => b.isCompactor && b.persistenceId === body.persistenceId
              );
            }
          }
        } else {
          if (Matter.Vertices.contains(body.vertices, point)) {
            return bodies.filter(
              (b) => b.isCompactor && b.persistenceId === body.persistenceId
            );
          }
        }
      }
    }
    // If no compactor hit, check normal lines.
    for (let body of bodies) {
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

  let hoveredLine = null;
  let pendingDeletionLine = null;
  let deletionTimer = null;
  let touchStartPos = null;
  let lastHovered = null;
  let hoveredLineStartTime = null;
  let pendingDeletionLineStartTime = null;

  function updatePulse() {
    // Hover pulse.
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
    // Pending deletion pulse.
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

  // Desktop hover: update cursor and pulse the hovered group.
  document.addEventListener("mousemove", (e) => {
    const line = getLineAtPoint(e.pageX, e.pageY);
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
    const target = getLineAtPoint(e.pageX, e.pageY);
    if (target) {
      // If compactor group, remove all.
      if (Array.isArray(target)) {
        target.forEach((body) =>
          Matter.World.remove(window.BallFall.world, body)
        );
        App.Persistence.deleteCompactor(target[0].persistenceId);
      } else {
        Matter.Composite.remove(window.BallFall.world, target, true);
        if (target.label === "Launcher" && target.persistenceId) {
          App.Persistence.deleteLauncher(target.persistenceId);
        } else if (target.persistenceId) {
          App.Persistence.deleteLine(target.persistenceId);
        }
      }
      e.preventDefault();
    }
  });

  // Mobile touch deletion.
  document.addEventListener("touchstart", (e) => {
    if (e.target.closest("#ballfall-ui")) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const target = getLineAtPoint(touch.pageX, touch.pageY);
    if (target) {
      touchStartPos = { x: touch.pageX, y: touch.pageY };
      pendingDeletionLine = target;
      deletionTimer = setTimeout(() => {
        if (Array.isArray(target)) {
          target.forEach((body) =>
            Matter.World.remove(window.BallFall.world, body)
          );
          App.Persistence.deleteCompactor(target[0].persistenceId);
        } else {
          Matter.World.remove(window.BallFall.world, target);
          if (target.label === "Launcher" && target.persistenceId) {
            App.Persistence.deleteLauncher(target.persistenceId);
          } else if (target.persistenceId) {
            App.Persistence.deleteLine(target.persistenceId);
          }
        }
        pendingDeletionLine = null;
      }, App.config.lineDeleteMobileHold);
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (e.target.closest("#ballfall-ui")) return;
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.pageX - (touchStartPos ? touchStartPos.x : 0);
    const dy = touch.pageY - (touchStartPos ? touchStartPos.y : 0);
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      clearTimeout(deletionTimer);
      deletionTimer = null;
      if (pendingDeletionLine) resetLine(pendingDeletionLine);
      pendingDeletionLine = null;
      touchStartPos = null;
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

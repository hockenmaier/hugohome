/* static/js/line-interaction.js */
/*
 * line-interaction.js
 * Provides hover pulse effects and deletion for drawn line bodies and compactors.
 * For compactors, all parts share the same persistenceId and are grouped together.
 */
(function () {
  // If target is a group (array) then apply a function to each
  const REFUND_RATE = App.config.refundRate;

  function applyToGroup(target, fn) {
    if (Array.isArray(target)) {
      target.forEach(fn);
    } else {
      fn(target);
    }
  }

  function resetLine(target) {
    applyToGroup(target, function (body) {
      // Launcher bodies
      if ((body.label === "Launcher" || body.isGear) && body.render) {
        if (body.render.sprite) body.render.sprite.opacity = 1;
        body.render.opacity = 1;
      }
      /* ---- Gears ---- */
      if (body.isGear && body.parts && body.parts.length > 1) {
        body.parts.forEach(function (part) {
          if (part.render) {
            if (part.render.sprite) part.render.sprite.opacity = 1;
            part.render.opacity = 1;
          }
        });
        return;
      }

      // Dotted lines
      else if (body.label === "DottedLine" && body.render) {
        body.render.fillStyle = App.config.dottedLineRender.fillStyle;
        body.render.strokeStyle = App.config.dottedLineRender.strokeStyle;
        body.render.lineWidth = App.config.dottedLineRender.lineWidth;
        body.render.opacity = 1;
      }
      // Compound curves (multi-part) or straight lines
      else if (body.parts && body.parts.length > 1) {
        // We assume any multi-part is a curved line
        const cfg = App.config.curvedLineRender;
        body.parts.forEach(function (part) {
          part.render.fillStyle = cfg.fillStyle;
          part.render.strokeStyle = cfg.strokeStyle;
          part.render.lineWidth = cfg.lineWidth;
          part.render.opacity = 1;
        });
      }
      // Single-segment straight lines
      else if (body.render) {
        body.render.fillStyle = App.config.straightLineRender.fillStyle;
        body.render.strokeStyle = App.config.straightLineRender.strokeStyle;
        body.render.lineWidth = App.config.straightLineRender.lineWidth;
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

  /* ---------- refund helpers ---------- */

  function priceForBody(b) {
    // compactor group
    if (Array.isArray(b)) return App.config.compactor.cost;

    // launchers
    if (b.label === "Launcher") {
      const t = b.selectedType || "launcher";
      return App.config.costs[t] || 0;
    }
    // dotted lines are free
    if (b.label === "DottedLine") return 0;

    // curved vs straight
    if (b.isLine) {
      return b.parts && b.parts.length > 1
        ? App.config.costs.curved
        : App.config.costs.straight;
    }

    if (b.isGear)
      return App.config.costs[b.spinDir === 1 ? "gear-cw" : "gear-ccw"];

    if (b.isBubbleWand) return App.config.costs["bubble-wand"];

    return 0;
  }

  function createNotification(text, x, y, opacity = 1) {
    const el = document.createElement("div");
    el.textContent = text;
    Object.assign(el.style, {
      position: "absolute",
      left: x + "px",
      top: y + "px",
      transform: "translate(-50%,-50%)",
      fontWeight: "bold",
      fontSize: "16px",
      color: "gold",
      textShadow: "1px 1px 2px black",
      zIndex: 10000,
      opacity,
    });
    document.body.appendChild(el);
    setTimeout(
      () => {
        el.style.transition = "opacity 500ms";
        el.style.opacity = "0";
        setTimeout(() => el.remove(), 500);
      },
      opacity === 1 ? 1000 : 0
    ); // previews disappear immediately on hide
  }

  // expose full-opacity version for other modules (auto-clicker)
  window.showRefundNotification = (amt, x, y) =>
    createNotification(`+ ${amt} Coins`, x, y, 1);

  /* ---------- hover preview ---------- */

  let hoverPreview = null;

  function showPreview(target, x, y) {
    const refund = Math.ceil(priceForBody(target) * REFUND_RATE);
    if (refund <= 0) return;
    if (!hoverPreview) hoverPreview = document.createElement("div");

    hoverPreview.textContent = `+ ${refund} coins`;
    Object.assign(hoverPreview.style, {
      position: "absolute",
      pointerEvents: "none",
      left: x + "px",
      top: y + "px",
      transform: "translate(-50%,-50%)",
      fontWeight: "bold",
      fontSize: "16px",
      color: "gold",
      opacity: "0.4",
      zIndex: 10000,
    });
    if (!hoverPreview.parentNode) document.body.appendChild(hoverPreview);
  }
  function hidePreview() {
    if (hoverPreview && hoverPreview.parentNode)
      hoverPreview.parentNode.removeChild(hoverPreview);
    hoverPreview = null;
  }

  // Modified getLineAtPoint: if the point is inside any compactor part,
  // return all bodies with that persistenceId.
  // --- hit-testing helper : returns body (or array) under point -------------
  function getLineAtPoint(x, y) {
    if (!window.BallFall || !window.BallFall.world) return null;

    /* ----- compensate for iOS pinch-zoom -------------------------------- */
    if (window.visualViewport && window.visualViewport.scale !== 1) {
      const vv = window.visualViewport;
      x = x / vv.scale + (vv.offsetLeft || 0);
      y = y / vv.scale + (vv.offsetTop || 0);
    }
    /* -------------------------------------------------------------------- */

    const point = { x, y };
    const bodies = Matter.Composite.allBodies(window.BallFall.world);

    /* 1) compactor group (unchanged) */
    for (let b of bodies) {
      if (b.isCompactor && b.persistenceId) {
        const targetParts = b.parts?.length > 1 ? b.parts.slice(1) : [b];
        if (
          targetParts.some((p) => Matter.Vertices.contains(p.vertices, point))
        )
          return bodies.filter(
            (bb) => bb.isCompactor && bb.persistenceId === b.persistenceId
          );
      }
    }

    /* 2) gears */
    for (let b of bodies) {
      if (b.isGear) {
        const parts = b.parts?.length > 1 ? b.parts.slice(1) : [b];
        if (parts.some((p) => Matter.Vertices.contains(p.vertices, point)))
          return b;
      }
    }

    /* 3) bubble-wand */
    for (let b of bodies) {
      if (b.isBubbleWand && Matter.Vertices.contains(b.vertices, point))
        return b;
    }

    /* 3) normal lines */
    for (let b of bodies) {
      if (b.isLine) {
        const parts = b.parts?.length > 1 ? b.parts.slice(1) : [b];
        if (parts.some((p) => Matter.Vertices.contains(p.vertices, point)))
          return b;
      }
    }
    return null;
  }

  let hoveredLine = null;
  let pendingTarget = null;
  let pendingDeletionLine = null;
  let deletionTimer = null;
  let touchStartPos = null;
  let lastHovered = null;
  let hoveredLineStartTime = null;
  let pendingDeletionLineStartTime = null;

  // ---------- animation loop ----------
  function updatePulse() {
    /* hover pulse (unchanged) */
    if (hoveredLine) {
      if (!hoveredLineStartTime) hoveredLineStartTime = Date.now();
      const t =
        (Math.sin((Date.now() - hoveredLineStartTime) / 75 + Math.PI / 2) + 1) /
        2;
      applyPulse(hoveredLine, 0.2 + 0.8 * t);
      lastHovered = hoveredLine;
    } else if (lastHovered) {
      resetLine(lastHovered);
      lastHovered = null;
      hoveredLineStartTime = null;
    }

    /* long-press (mobile) pulse for delete-preview */
    if (pendingTarget && pendingTarget !== hoveredLine) {
      if (!pendingDeletionLineStartTime)
        pendingDeletionLineStartTime = Date.now();
      const t =
        (Math.sin(
          (Date.now() - pendingDeletionLineStartTime) / 75 + Math.PI / 2
        ) +
          1) /
        2;
      applyPulse(pendingTarget, 0.2 + 0.8 * t);
    } else {
      pendingDeletionLineStartTime = null;
    }

    requestAnimationFrame(updatePulse);
  }
  updatePulse();

  /* ---------- desktop hover ---------- */

  document.addEventListener("mousemove", (e) => {
    const line = getLineAtPoint(e.pageX, e.pageY);

    if (line) {
      if (hoveredLine !== line) {
        if (hoveredLine) resetLine(hoveredLine);
        hoveredLine = line;
      }
      document.body.style.cursor = "pointer";
      showPreview(line, e.pageX, e.pageY);
    } else {
      if (hoveredLine) resetLine(hoveredLine);
      hoveredLine = null;
      document.body.style.cursor = "";
      hidePreview();
    }
  });

  /* ---------- deletion & refund: desktop ---------- */

  document.addEventListener("contextmenu", (e) => {
    const tool = window.getActiveTool && window.getActiveTool();
    if (tool && tool.state && tool.state !== 0) return; // if preview in progress → skip delete

    const target = getLineAtPoint(e.pageX, e.pageY);
    if (!target) return;

    e.preventDefault();
    hidePreview();

    const refund = Math.ceil(priceForBody(target) * REFUND_RATE);
    if (refund > 0) {
      App.config.coins += refund;
      App.updateCoinsDisplay();
      window.showRefundNotification(refund, e.pageX, e.pageY);
    }

    // delete (logic unchanged)
    if (Array.isArray(target)) {
      target.forEach((b) => Matter.World.remove(window.BallFall.world, b));
      App.Persistence.deleteCompactor(target[0].persistenceId);
    } else {
      Matter.Composite.remove(window.BallFall.world, target, true);
      if (target.isGear) {
        App.Persistence.deleteGear(target.persistenceId);
      } else if (target.isBubbleWand) {
        App.Persistence.deleteBubbleWand(target.persistenceId);
      } else if (target.label === "Launcher") {
        App.Persistence.deleteLauncher(target.persistenceId);
      } else if (target.persistenceId) {
        App.Persistence.deleteLine(target.persistenceId);
      }
    }
  });

  /* ---------- mobile touch deletion & refund ---------- */

  document.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1 || e.target.closest("#ballfall-ui")) return;
    const touch = e.touches[0];
    const tgt = getLineAtPoint(touch.pageX, touch.pageY);
    if (!tgt) return;

    pendingTarget = tgt;
    touchStartPos = { x: touch.pageX, y: touch.pageY };

    deletionTimer = setTimeout(() => {
      const refund = Math.ceil(priceForBody(tgt) * REFUND_RATE);
      if (refund > 0) {
        App.config.coins += refund;
        App.updateCoinsDisplay();
        window.showRefundNotification(refund, touchStartPos.x, touchStartPos.y);
      }

      if (Array.isArray(tgt)) {
        tgt.forEach((b) => Matter.World.remove(window.BallFall.world, b));
        App.Persistence.deleteCompactor(tgt[0].persistenceId);
      } else {
        Matter.World.remove(window.BallFall.world, tgt);

        /* NEW → gear deletion parity with desktop */
        if (tgt.isGear) {
          App.Persistence.deleteGear(tgt.persistenceId);
        } else if (tgt.label === "Launcher") {
          /* existing cases */
          App.Persistence.deleteLauncher(tgt.persistenceId);
        } else if (tgt.isBubbleWand) {
          App.Persistence.deleteBubbleWand(tgt.persistenceId);
        } else if (tgt.persistenceId) {
          App.Persistence.deleteLine(tgt.persistenceId);
        }
      }
      pendingTarget = null;
      hidePreview();
    }, App.config.lineDeleteMobileHold);
  });

  document.addEventListener("touchmove", (e) => {
    if (!pendingTarget) return;
    const touch = e.touches[0];
    const dx = touch.pageX - touchStartPos.x,
      dy = touch.pageY - touchStartPos.y;
    if (Math.hypot(dx, dy) > 10) {
      clearTimeout(deletionTimer);
      resetLine(pendingTarget);
      pendingTarget = null;
      hidePreview();
    }
  });

  document.addEventListener("touchend", () => {
    clearTimeout(deletionTimer);
    resetLine(pendingTarget);
    pendingTarget = null;
    hidePreview();
  });


  /* --- expose preview helper so other modules (e.g. auto-clicker) can reuse it --- */
  window.showRefundPreview = (amt, x, y) =>
    createNotification(`+ ${amt} coins`, x, y, 0.4);
  window.hideRefundPreview = hidePreview;
})();

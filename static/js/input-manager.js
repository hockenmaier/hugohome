/* static/js/inputManager.js */
/*
 * inputManager.js
 * Consolidates global mouse and touch event handling for drawing tools.
 * Modified: if a UI element is clicked and an active tool exists, finish the active tool.
 */
(function () {
  // Determine the active drawing tool based on current mode.
  function getActiveTool() {
    const mode = App.modules.lines.getMode();
    switch (mode) {
      case "straight":
        return App.modules.lines.StraightLineTool;
      case "curved":
        return window.CurvedLineTool;
      case "dotted":
        return window.DottedLineTool;
      case "launcher":
        return window.LauncherCreateTool;
      case "compactor":
        return window.CompactorCreateTool;
      default:
        return null;
    }
  }

  // Mouse move event.
  document.addEventListener("mousemove", (e) => {
    const tool = getActiveTool();
    if (tool && typeof tool.onMove === "function") {
      tool.onMove(e.pageX, e.pageY);
    }
  });

  // Click event.
  document.addEventListener("click", (e) => {
    if (BaseDrawingTool.ignoreNextClick) {
      BaseDrawingTool.ignoreNextClick = false;
      return;
    }
    const uiEl = e.target.closest("#ballfall-ui, #spawner-container");
    const tool = getActiveTool();
    // If UI element is clicked but an active tool is in progress, finish the tool.
    if (
      uiEl &&
      tool &&
      tool.state &&
      tool.state !== 0 &&
      typeof tool.onClick === "function"
    ) {
      tool.onClick(e.pageX, e.pageY);
      return;
    }
    // Otherwise, ignore clicks on UI.
    if (uiEl) return;
    if (tool && typeof tool.onClick === "function") {
      tool.onClick(e.pageX, e.pageY);
    }
  });

  // Right-click (contextmenu) event.
  document.addEventListener("contextmenu", (e) => {
    const tool = getActiveTool();
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
    // Allow deletion via line-interaction.js (handled there)
  });

  // Touch events.
  document.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    if (e.target.closest("#ballfall-ui, #spawner-container")) return;
    const touch = e.touches[0];
    const tool = getActiveTool();
    if (tool && typeof tool.onTouchStart === "function") {
      tool.onTouchStart(touch.pageX, touch.pageY);
    }
  });

  document.addEventListener("touchmove", (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const tool = getActiveTool();
    if (tool && typeof tool.onTouchMove === "function") {
      tool.onTouchMove(touch.pageX, touch.pageY);
    }
  });

  document.addEventListener("touchend", (e) => {
    const touch = e.changedTouches[0];
    const tool = getActiveTool();
    if (tool && typeof tool.onTouchEnd === "function") {
      tool.onTouchEnd(touch.pageX, touch.pageY);
    }
  });
})();

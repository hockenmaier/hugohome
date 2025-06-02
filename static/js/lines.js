/* static/js/lines.js */
/*
 * lines.js
 * Implements the straight line drawing tool.
 * Uses BaseDrawingTool for common coin checks and drawing math.
 */
App.modules.lines = (function () {
  let mode = "straight"; // current drawing mode
  let lastFinishTime = 0; // global finish time (could be moved to App.config)

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
      }
    },

    onMove(x, y) {
      if (this.state !== 1) return;
      this.updatePreview(x, y);
    },

    updatePreview(x, y) {
      if (!window.BallFall || !window.BallFall.world) return;
      if (this.previewLine) {
        this.previewLine = BaseDrawingTool.removePreview(this.previewLine);
      }
      const { midX, midY, angle, length } = BaseDrawingTool.computeLineMetrics(
        this.firstPoint,
        x,
        y
      );
      const renderOptions = App.config.straightLinePreviewRender || {
        fillStyle: "rgba(149,110,255,0.5)",
        strokeStyle: "rgba(149,110,255,0.5)",
        lineWidth: 1,
      };
      this.previewLine = Matter.Bodies.rectangle(
        midX,
        midY,
        length,
        App.config.lineThickness,
        {
          isStatic: true,
          angle: angle,
          render: renderOptions,
        }
      );
      Matter.World.add(window.BallFall.world, this.previewLine);
    },

    finish(x, y) {
      if (this.previewLine) {
        Matter.World.remove(window.BallFall.world, this.previewLine);
        this.previewLine = null;
      }
      const { midX, midY, angle, length } = BaseDrawingTool.computeLineMetrics(
        this.firstPoint,
        x,
        y
      );
      const renderOptions = App.config.straightLineRender || {
        fillStyle: "#956eff",
        strokeStyle: "#956eff",
        lineWidth: 1,
      };
      const lineBody = Matter.Bodies.rectangle(
        midX,
        midY,
        length,
        App.config.lineThickness,
        {
          isStatic: true,
          angle: angle,
          render: renderOptions,
        }
      );
      Matter.World.add(window.BallFall.world, lineBody);
      lineBody.isLine = true;
      let persistentId = App.Persistence.saveLine({
        type: "straight",
        p1: this.firstPoint,
        p2: { x, y },
      });
      lineBody.persistenceId = persistentId;
      this.state = 0;
      this.firstPoint = null;
      lastFinishTime = Date.now();
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
      BaseDrawingTool.prototype.handleTouchStart.call(
        this,
        x,
        y,
        function (x, y) {
          // Use the original onClick to start drawing
          this.onClick(x, y);
        }
      );
    },
    onTouchMove(x, y) {
      BaseDrawingTool.prototype.handleTouchMove.call(this, x, y, this.onMove);
    },
    onTouchEnd(x, y) {
      BaseDrawingTool.prototype.handleTouchEnd.call(
        this,
        x,
        y,
        this.finish,
        this.cancel,
        App.config.costs.straight
      );
    },
  };

  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  function setMode(newMode) {
    // cancel preview of previous tool
    switch (mode) {
      case "straight":
        StraightLineTool.cancel();
        break;
      case "curved":
        if (window.CurvedLineTool) window.CurvedLineTool.cancel();
        break;
      case "dotted":
        if (window.DottedLineTool) window.DottedLineTool.cancel();
        break;
      case "launcher":
        if (window.LauncherCreateTool) LauncherCreateTool.cancel();
        break;
      case "compactor":
        if (window.CompactorCreateTool) CompactorCreateTool.cancel();
        break;
      case "gear":
        if (window.GearCreateTool) GearCreateTool.cancel();
        break;
      case "bubble-wand":
        if (window.BubbleWandCreateTool) BubbleWandCreateTool.cancel();
        break;
    }

    mode = newMode;

    // for touch, prevent scroll when any tool is active
    if (isTouchDevice) {
      document.body.style.overflow = newMode !== "none" ? "hidden" : "";
    }
  }

  function getMode() {
    return mode;
  }

  function addLine(body) {
    body.isLine = true;
  }

  return { init: function () {}, setMode, getMode, addLine, StraightLineTool };
})();

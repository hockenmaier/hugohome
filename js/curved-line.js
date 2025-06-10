/* static/js/curved-line.js */
/*
 * curved-line.js
 * Implements the curved line drawing tool.
 * Uses a quadratic Bézier curve approximated by compound rectangles.
 */
window.CurvedLineTool = {
  state: 0, // 0: waiting for start, 1: waiting for end, 2: waiting for control
  startPoint: null,
  endPoint: null,
  previewCompound: null,
  currentControl: null,

  onClick(x, y) {
    if (this.state === 0) {
      const tool = new BaseDrawingTool("curved", App.config.costs.curved);
      if (!tool.canPlace()) {
        BaseDrawingTool.showInsufficientFunds();
        return;
      }
      this.startPoint = { x, y };
      this.state = 1;
    } else if (this.state === 1) {
      this.endPoint = { x, y };
      this.state = 2;
    } else if (this.state === 2) {
      this.finish(x, y);
      new BaseDrawingTool("curved", App.config.costs.curved).charge();
    }
  },

  onMove(x, y) {
    if (this.state === 0) return;
    if (this.state === 1) {
      if (this.previewCompound) {
        Matter.World.remove(window.BallFall.world, this.previewCompound);
        this.previewCompound = null;
      }
      const { midX, midY, angle, length } = BaseDrawingTool.computeLineMetrics(
        this.startPoint,
        x,
        y
      );
      const previewRender = App.config.curvedLinePreviewRender || {
        fillStyle: "rgba(120, 110, 255,0.5)",
        strokeStyle: "rgba(120, 110, 255,0.5)",
        lineWidth: 1,
      };
      this.previewCompound = Matter.Bodies.rectangle(
        midX,
        midY,
        length,
        App.config.lineThickness * 1.05,
        {
          isStatic: true,
          label: "CurvedLine",
          angle: angle,
          render: previewRender,
        }
      );
      Matter.World.add(window.BallFall.world, this.previewCompound);
    } else if (this.state === 2) {
      if (this.previewCompound) {
        Matter.World.remove(window.BallFall.world, this.previewCompound);
        this.previewCompound = null;
      }
      this.currentControl = { x, y };
      this.previewCompound = generateCurveCompoundBody(
        this.startPoint,
        this.currentControl,
        this.endPoint,
        App.config.curvedLineFidelity,
        App.config.lineThickness * 1.05,
        App.config.curvedLineRender || {
          fillStyle: "#956eff",
          strokeStyle: "#956eff",
          lineWidth: 1,
        }
      );
      Matter.World.add(window.BallFall.world, this.previewCompound);
    }
  },

  finish(controlX, controlY) {
    if (this.previewCompound) {
      Matter.World.remove(window.BallFall.world, this.previewCompound);
      this.previewCompound = null;
    }
    const compound = generateCurveCompoundBody(
      this.startPoint,
      { x: controlX, y: controlY },
      this.endPoint,
      App.config.curvedLineFidelity,
      App.config.lineThickness * 1.05,
      App.config.curvedLineRender || {
        fillStyle: "#956eff",
        strokeStyle: "#956eff",
        lineWidth: 1,
      }
    );
    Matter.World.add(window.BallFall.world, compound);
    if (
      window.App.modules.lines &&
      typeof window.App.modules.lines.addLine === "function"
    ) {
      window.App.modules.lines.addLine(compound);
    }
    let persistentId = App.Persistence.saveLine({
      type: "curved",
      startPoint: this.startPoint,
      endPoint: this.endPoint,
      controlPoint: { x: controlX, y: controlY },
      fidelity: App.config.curvedLineFidelity,
    });
    compound.persistenceId = persistentId;
    if (App.Achievements && App.Achievements.recordDrawable)
      App.Achievements.recordDrawable();
    this.state = 0;
    this.startPoint = null;
    this.endPoint = null;
    this.currentControl = null;
    if (
      App.modules.lines &&
      typeof App.modules.lines.setIgnoreNextClick === "function"
    ) {
      App.modules.lines.setIgnoreNextClick(true);
    }
  },

  cancel() {
    if (this.previewCompound) {
      Matter.World.remove(window.BallFall.world, this.previewCompound);
      this.previewCompound = null;
    }
    this.state = 0;
    this.startPoint = null;
    this.endPoint = null;
    this.currentControl = null;
  },

  onTouchStart(x, y) {
    BaseDrawingTool.prototype.handleTouchStart.call(
      this,
      x,
      y,
      function (x, y) {
        if (this.state === 0) {
          const tool = new BaseDrawingTool("curved", App.config.costs.curved);
          if (!tool.canPlace()) {
            BaseDrawingTool.showInsufficientFunds();
            return;
          }
          this.startPoint = { x, y };
          this.state = 1;
        }
      }
    );
  },
  onTouchMove(x, y) {
    BaseDrawingTool.prototype.handleTouchMove.call(this, x, y, this.onMove);
  },
  onTouchEnd(x, y) {
    if (this.state === 1) {
      // First step: create the Bézier preview without charging.
      // If no valid drag occurred, cancel.
      if (
        !this._hasMoved ||
        !BaseDrawingTool.isValidDrag(this._mobileStartPoint, x, y)
      ) {
        this.cancel();
        BaseDrawingTool.ignoreNextClick = true;
        return;
      }
      this.endPoint = { x, y };
      if (this.previewCompound) {
        Matter.World.remove(window.BallFall.world, this.previewCompound);
        this.previewCompound = null;
      }
      const defaultControl = {
        x: (this.startPoint.x + this.endPoint.x) / 2,
        y: (this.startPoint.y + this.endPoint.y) / 2,
      };
      this.currentControl = defaultControl;
      this.previewCompound = generateCurveCompoundBody(
        this.startPoint,
        this.currentControl,
        this.endPoint,
        App.config.curvedLineFidelity,
        App.config.lineThickness * 1.05,
        App.config.curvedLineRender || {
          fillStyle: "rgba(120, 110, 255,0.5)",
          strokeStyle: "rgba(120, 110, 255,0.5)",
          lineWidth: 1,
        }
      );
      Matter.World.add(window.BallFall.world, this.previewCompound);
      this.state = 2;
    } else if (this.state === 2) {
      // Second step: finalize the curve and charge coins.
      BaseDrawingTool.prototype.handleTouchEnd.call(
        this,
        x,
        y,
        function (x, y) {
          this.finish(x, y);
          this.currentControl = null;
        },
        this.cancel,
        App.config.costs.curved
      );
    }
  },

  onTouchCancel(x, y) {
    if (this.state === 2) {
      const ctrl = this.currentControl || { x, y };
      const tool = new BaseDrawingTool("curved", App.config.costs.curved);
      if (!tool.canPlace()) {
        BaseDrawingTool.showInsufficientFunds();
        this.cancel();
        return;
      }
      this.finish(ctrl.x, ctrl.y);
      tool.charge();
    } else {
      this.cancel();
    }
  },
};

// Helper: quadratic Bézier calculation.
function quadraticBezier(points, t) {
  const [p0, p1, p2] = points;
  return {
    x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
    y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
  };
}

// Helper: generate a compound body approximating a curved stroke.
function generateCurveCompoundBody(
  p0,
  control,
  p2,
  numSegments,
  thickness,
  renderOptions
) {
  const parts = [];
  let prevPt = quadraticBezier([p0, control, p2], 0);
  for (let i = 1; i <= numSegments; i++) {
    const t = i / numSegments;
    const pt = quadraticBezier([p0, control, p2], t);
    const mid = { x: (prevPt.x + pt.x) / 2, y: (prevPt.y + pt.y) / 2 };
    const dx = pt.x - prevPt.x;
    const dy = pt.y - prevPt.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const segment = Matter.Bodies.rectangle(mid.x, mid.y, length, thickness, {
      isStatic: true,
      label: "CurvedLine",
      angle: angle,
      render: renderOptions,
    });
    parts.push(segment);
    prevPt = pt;
  }
  return Matter.Body.create({
    parts: parts,
    isStatic: true,
    label: "CurvedLine",
    render: renderOptions,
  });
}

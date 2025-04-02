window.CurvedLineTool = {
  state: 0, // 0: waiting for start, 1: waiting for end, 2: waiting for control
  startPoint: null,
  endPoint: null,
  previewCompound: null,

  // Desktop click-based methods
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
      if (App.savePlacedObjects) App.savePlacedObjects();
    }
  },

  onMove(x, y) {
    if (this.state === 0) return;
    if (this.state === 1) {
      // Show a straight-line preview (as a rectangle) between startPoint and current pointer.
      if (this.previewCompound) {
        Matter.World.remove(window.BallFall.world, this.previewCompound);
        this.previewCompound = null;
      }
      const dx = x - this.startPoint.x,
        dy = y - this.startPoint.y,
        midX = (this.startPoint.x + x) / 2,
        midY = (this.startPoint.y + y) / 2,
        angle = Math.atan2(dy, dx),
        length = Math.sqrt(dx * dx + dy * dy);
      this.previewCompound = Matter.Bodies.rectangle(
        midX,
        midY,
        length,
        App.config.lineThickness * 1.05,
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
      Matter.World.add(window.BallFall.world, this.previewCompound);
    } else if (this.state === 2) {
      // In control phase, use current pointer as the control point and preview a compound curved body.
      if (this.previewCompound) {
        Matter.World.remove(window.BallFall.world, this.previewCompound);
        this.previewCompound = null;
      }
      // The current pointer (x,y) serves as the control point.
      this.previewCompound = generateCurveCompoundBody(
        this.startPoint,
        { x, y },
        this.endPoint,
        App.config.curvedLineFidelity,
        App.config.lineThickness * 1.05,
        {
          fillStyle: "rgba(149,110,255,0.5)",
          strokeStyle: "rgba(149,110,255,0.5)",
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
    // Use the final control point provided at finish.
    const compound = generateCurveCompoundBody(
      this.startPoint,
      { x: controlX, y: controlY },
      this.endPoint,
      App.config.curvedLineFidelity,
      App.config.lineThickness * 1.05,
      {
        fillStyle: "#956eff",
        strokeStyle: "#956eff",
        lineWidth: 1,
      }
    );
    Matter.World.add(window.BallFall.world, compound);
    if (window.App.modules.lines && window.App.modules.lines.addLine)
      window.App.modules.lines.addLine(compound);
    this.state = 0;
    this.startPoint = null;
    this.endPoint = null;
  },

  cancel() {
    if (this.previewCompound) {
      Matter.World.remove(window.BallFall.world, this.previewCompound);
      this.previewCompound = null;
    }
    this.state = 0;
    this.startPoint = null;
    this.endPoint = null;
  },

  // Mobile touch methods mirror desktop behavior.
  // In curved-line.js, update the mobile methods:
  // Mobile touch methods for CurvedLineTool in curved-line.js
  onTouchStart(x, y) {
    if (this.state === 0) {
      const tool = new BaseDrawingTool("curved", App.config.costs.curved);
      if (!tool.canPlace()) {
        BaseDrawingTool.showInsufficientFunds();
        return;
      }
      this.startPoint = { x, y };
      this.state = 1;
    }
    // In state 2, no special action on touchstart
  },
  onTouchMove(x, y) {
    if (this.state === 1) {
      // Update straight-line preview during first session.
      if (this.previewCompound) {
        Matter.World.remove(window.BallFall.world, this.previewCompound);
        this.previewCompound = null;
      }
      const dx = x - this.startPoint.x,
        dy = y - this.startPoint.y,
        midX = (this.startPoint.x + x) / 2,
        midY = (this.startPoint.y + y) / 2,
        angle = Math.atan2(dy, dx),
        length = Math.sqrt(dx * dx + dy * dy);
      this.previewCompound = Matter.Bodies.rectangle(
        midX,
        midY,
        length,
        App.config.lineThickness * 1.05,
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
      Matter.World.add(window.BallFall.world, this.previewCompound);
    } else if (this.state === 2) {
      // During second session, update the curve preview using current pointer as control.
      if (this.previewCompound) {
        Matter.World.remove(window.BallFall.world, this.previewCompound);
        this.previewCompound = null;
      }
      this.previewCompound = generateCurveCompoundBody(
        this.startPoint,
        { x, y },
        this.endPoint,
        App.config.curvedLineFidelity,
        App.config.lineThickness * 1.05,
        {
          fillStyle: "rgba(149,110,255,0.5)",
          strokeStyle: "rgba(149,110,255,0.5)",
          lineWidth: 1,
        }
      );
      Matter.World.add(window.BallFall.world, this.previewCompound);
    }
  },
  onTouchEnd(x, y) {
    if (this.state === 1) {
      // First session: finalize end point and create default curve preview.
      this.endPoint = { x, y };
      if (this.previewCompound) {
        Matter.World.remove(window.BallFall.world, this.previewCompound);
        this.previewCompound = null;
      }
      const defaultControl = {
        x: (this.startPoint.x + this.endPoint.x) / 2,
        y: (this.startPoint.y + this.endPoint.y) / 2,
      };
      this.previewCompound = generateCurveCompoundBody(
        this.startPoint,
        defaultControl,
        this.endPoint,
        App.config.curvedLineFidelity,
        App.config.lineThickness * 1.05,
        {
          fillStyle: "rgba(149,110,255,0.5)",
          strokeStyle: "rgba(149,110,255,0.5)",
          lineWidth: 1,
        }
      );
      Matter.World.add(window.BallFall.world, this.previewCompound);
      this.state = 2;
    } else if (this.state === 2) {
      // Second session: use current pointer as control to finalize the curve.
      this.finish(x, y);
      new BaseDrawingTool("curved", App.config.costs.curved).charge();
      if (App.savePlacedObjects) App.savePlacedObjects();
    }
  },
};

// --- Helper functions ---

// Compute a point on a quadratic Bezier for a given t.
function quadraticBezier(points, t) {
  const [p0, p1, p2] = points;
  return {
    x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
    y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
  };
}

// Generate a compound body approximating a curved stroke by splitting the Bezier curve into segments.
// Each segment is rendered as a small rectangle, and the compound body is the union of these parts.
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
      angle: angle,
      render: renderOptions,
    });
    parts.push(segment);
    prevPt = pt;
  }
  return Matter.Body.create({
    parts: parts,
    isStatic: true,
    render: renderOptions,
  });
}

window.CurvedLineTool = {
  state: 0, // 0: waiting for start, 1: waiting for end, 2: waiting for control
  startPoint: null,
  endPoint: null,
  previewCurve: null,
  // Desktop methods (using clicks)
  onClick(x, y) {
    if (this.state === 0) {
      this.startPoint = { x, y };
      this.state = 1;
    } else if (this.state === 1) {
      this.endPoint = { x, y };
      this.state = 2;
    } else if (this.state === 2) {
      this.finish(x, y);
    }
  },
  onMove(x, y) {
    if (this.state === 0) return;
    if (this.state === 1) {
      if (this.previewCurve) {
        Matter.World.remove(window.BallFall.world, this.previewCurve);
        this.previewCurve = null;
      }
      const dx = x - this.startPoint.x,
        dy = y - this.startPoint.y,
        midX = (this.startPoint.x + x) / 2,
        midY = (this.startPoint.y + y) / 2;
      this.previewCurve = Matter.Bodies.rectangle(
        midX,
        midY,
        Math.sqrt(dx * dx + dy * dy),
        App.config.lineThickness,
        {
          isStatic: true,
          angle: Math.atan2(dy, dx),
          render: {
            fillStyle: "rgba(149,110,255,0.5)",
            strokeStyle: "rgba(149,110,255,0.5)",
            lineWidth: 1,
          },
        }
      );
      Matter.World.add(window.BallFall.world, this.previewCurve);
    } else if (this.state === 2) {
      if (this.previewCurve) {
        Matter.World.remove(window.BallFall.world, this.previewCurve);
        this.previewCurve = null;
      }
      const control = { x, y },
        points = [this.startPoint, control, this.endPoint],
        numSegments = 20,
        vertices = [];
      for (let i = 0; i <= numSegments; i++) {
        const t = i / numSegments;
        vertices.push(quadraticBezier(points, t));
      }
      this.previewCurve = Matter.Bodies.fromVertices(
        0,
        0,
        [vertices],
        {
          isStatic: true,
          render: {
            fillStyle: "rgba(149,110,255,0.5)",
            strokeStyle: "rgba(149,110,255,0.5)",
            lineWidth: 1,
          },
        },
        true
      );
      Matter.World.add(window.BallFall.world, this.previewCurve);
    }
  },
  finish(controlX, controlY) {
    if (this.previewCurve) {
      Matter.World.remove(window.BallFall.world, this.previewCurve);
      this.previewCurve = null;
    }
    const control = { x: controlX, y: controlY },
      points = [this.startPoint, control, this.endPoint],
      numSegments = 20,
      vertices = [];
    for (let i = 0; i <= numSegments; i++) {
      const t = i / numSegments;
      vertices.push(quadraticBezier(points, t));
    }
    const curveBody = Matter.Bodies.fromVertices(
      0,
      0,
      [vertices],
      {
        isStatic: true,
        render: {
          fillStyle: "#956eff",
          strokeStyle: "#956eff",
          lineWidth: 1,
        },
      },
      true
    );
    Matter.World.add(window.BallFall.world, curveBody);
    if (window.App.modules.lines && window.App.modules.lines.addLine)
      window.App.modules.lines.addLine(curveBody);
    this.state = 0;
    this.startPoint = null;
    this.endPoint = null;
  },
  cancel() {
    if (this.previewCurve) {
      Matter.World.remove(window.BallFall.world, this.previewCurve);
      this.previewCurve = null;
    }
    this.state = 0;
    this.startPoint = null;
    this.endPoint = null;
  },
  // Mobile methods (using touch sequences)
  onTouchStart(x, y) {
    if (this.state === 0) {
      // First touch: set start point.
      this.startPoint = { x, y };
      this.state = 1;
    } else if (this.state === 2) {
      // In control phase, begin previewing control.
      // (No state change; onTouchMove will handle preview.)
    }
  },
  onTouchMove(x, y) {
    if (this.state === 1) {
      // Preview a straight line as candidate for end point.
      if (this.previewCurve) {
        Matter.World.remove(window.BallFall.world, this.previewCurve);
        this.previewCurve = null;
      }
      const dx = x - this.startPoint.x,
        dy = y - this.startPoint.y,
        midX = (this.startPoint.x + x) / 2,
        midY = (this.startPoint.y + y) / 2;
      this.previewCurve = Matter.Bodies.rectangle(
        midX,
        midY,
        Math.sqrt(dx * dx + dy * dy),
        App.config.lineThickness,
        {
          isStatic: true,
          angle: Math.atan2(dy, dx),
          render: {
            fillStyle: "rgba(149,110,255,0.5)",
            strokeStyle: "rgba(149,110,255,0.5)",
            lineWidth: 1,
          },
        }
      );
      Matter.World.add(window.BallFall.world, this.previewCurve);
    } else if (this.state === 2) {
      // Preview curved line using current point as control.
      if (this.previewCurve) {
        Matter.World.remove(window.BallFall.world, this.previewCurve);
        this.previewCurve = null;
      }
      const control = { x, y },
        points = [this.startPoint, control, this.endPoint],
        numSegments = 20,
        vertices = [];
      for (let i = 0; i <= numSegments; i++) {
        const t = i / numSegments;
        vertices.push(quadraticBezier(points, t));
      }
      this.previewCurve = Matter.Bodies.fromVertices(
        0,
        0,
        [vertices],
        {
          isStatic: true,
          render: {
            fillStyle: "rgba(149,110,255,0.5)",
            strokeStyle: "rgba(149,110,255,0.5)",
            lineWidth: 1,
          },
        },
        true
      );
      Matter.World.add(window.BallFall.world, this.previewCurve);
    }
  },
  onTouchEnd(x, y) {
    if (this.state === 1) {
      // End phase one: set end point and switch to control phase.
      if (this.previewCurve) {
        Matter.World.remove(window.BallFall.world, this.previewCurve);
        this.previewCurve = null;
      }
      this.endPoint = { x, y };
      this.state = 2;
    } else if (this.state === 2) {
      // Finish by using this touch's point as control.
      this.finish(x, y);
    }
  },
};

function quadraticBezier(points, t) {
  const [p0, p1, p2] = points;
  return {
    x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
    y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
  };
}

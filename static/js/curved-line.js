window.CurvedLineTool = {
  state: 0, // 0: waiting for start, 1: waiting for end, 2: waiting for control
  startPoint: null,
  endPoint: null,
  previewCurve: null,
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
      // Preview straight line between startPoint and current (x,y)
      if (this.previewCurve) {
        Matter.World.remove(window.BallFall.world, this.previewCurve);
        this.previewCurve = null;
      }
      const dx = x - this.startPoint.x,
        dy = y - this.startPoint.y,
        length = Math.sqrt(dx * dx + dy * dy),
        angle = Math.atan2(dy, dx),
        midX = (this.startPoint.x + x) / 2,
        midY = (this.startPoint.y + y) / 2;
      this.previewCurve = Matter.Bodies.rectangle(
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
      Matter.World.add(window.BallFall.world, this.previewCurve);
    } else if (this.state === 2) {
      // Preview curved line using current (x,y) as control
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
};

function quadraticBezier(points, t) {
  const [p0, p1, p2] = points;
  return {
    x: (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x,
    y: (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y,
  };
}

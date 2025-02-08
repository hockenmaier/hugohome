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
        polygon = generateCurvePolygon(
          this.startPoint,
          control,
          this.endPoint,
          20,
          App.config.lineThickness
        ),
        centroid = computeCentroid(polygon),
        localVertices = polygon.map((v) => ({
          x: v.x - centroid.x,
          y: v.y - centroid.y,
        }));
      this.previewCurve = Matter.Bodies.fromVertices(
        centroid.x,
        centroid.y,
        [localVertices],
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
      polygon = generateCurvePolygon(
        this.startPoint,
        control,
        this.endPoint,
        20,
        App.config.lineThickness
      ),
      centroid = computeCentroid(polygon),
      localVertices = polygon.map((v) => ({
        x: v.x - centroid.x,
        y: v.y - centroid.y,
      })),
      curveBody = Matter.Bodies.fromVertices(
        centroid.x,
        centroid.y,
        [localVertices],
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
      this.startPoint = { x, y };
      this.state = 1;
    } else if (this.state === 2) {
      // In control phase; onTouchMove will update preview.
    }
  },
  onTouchMove(x, y) {
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
        polygon = generateCurvePolygon(
          this.startPoint,
          control,
          this.endPoint,
          20,
          App.config.lineThickness
        ),
        centroid = computeCentroid(polygon),
        localVertices = polygon.map((v) => ({
          x: v.x - centroid.x,
          y: v.y - centroid.y,
        }));
      this.previewCurve = Matter.Bodies.fromVertices(
        centroid.x,
        centroid.y,
        [localVertices],
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
      if (this.previewCurve) {
        Matter.World.remove(window.BallFall.world, this.previewCurve);
        this.previewCurve = null;
      }
      this.endPoint = { x, y };
      this.state = 2;
    } else if (this.state === 2) {
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

function generateCurvePolygon(p0, p1, p2, numSegments, thickness) {
  const centerPoints = [];
  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;
    centerPoints.push(quadraticBezier([p0, p1, p2], t));
  }
  const upper = [];
  const lower = [];
  for (let i = 0; i < centerPoints.length; i++) {
    const pt = centerPoints[i];
    let tangent;
    if (i === 0) {
      tangent = {
        x: centerPoints[i + 1].x - pt.x,
        y: centerPoints[i + 1].y - pt.y,
      };
    } else if (i === centerPoints.length - 1) {
      tangent = {
        x: pt.x - centerPoints[i - 1].x,
        y: pt.y - centerPoints[i - 1].y,
      };
    } else {
      tangent = {
        x: centerPoints[i + 1].x - centerPoints[i - 1].x,
        y: centerPoints[i + 1].y - centerPoints[i - 1].y,
      };
    }
    const len = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
    if (len !== 0) {
      tangent.x /= len;
      tangent.y /= len;
    }
    const normal = { x: -tangent.y, y: tangent.x };
    upper.push({
      x: pt.x + (normal.x * thickness) / 2,
      y: pt.y + (normal.y * thickness) / 2,
    });
    lower.push({
      x: pt.x - (normal.x * thickness) / 2,
      y: pt.y - (normal.y * thickness) / 2,
    });
  }
  return upper.concat(lower.reverse());
}

function computeCentroid(vertices) {
  const centroid = { x: 0, y: 0 };
  vertices.forEach((v) => {
    centroid.x += v.x;
    centroid.y += v.y;
  });
  centroid.x /= vertices.length;
  centroid.y /= vertices.length;
  return centroid;
}

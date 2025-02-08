window.LauncherCreateTool = {
  state: 0, // 0: waiting for start, 1: waiting for direction
  startPoint: null,
  launcherPreview: null,
  previewLine: null,
  arrowPreview: null,

  onClick(x, y) {
    if (this.state === 0) {
      this.startPoint = { x, y };
      const size = 40;
      this.launcherPreview = Matter.Bodies.rectangle(x, y, size, size, {
        isStatic: true,
        isSensor: true,
        label: "Launcher",
        render: {
          sprite: { texture: "/images/launcher.png", xScale: 1, yScale: 1 },
          opacity: 0.6,
        },
      });
      Matter.World.add(window.BallFall.world, this.launcherPreview);
      this.state = 1;
    } else if (this.state === 1) {
      this.finish(x, y);
    }
  },

  onMove(x, y) {
    if (this.state !== 1) return;
    if (this.previewLine) {
      Matter.World.remove(window.BallFall.world, this.previewLine);
      this.previewLine = null;
    }
    if (this.arrowPreview) {
      Matter.World.remove(window.BallFall.world, this.arrowPreview);
      this.arrowPreview = null;
    }
    const dx = x - this.startPoint.x,
      dy = y - this.startPoint.y;
    const length = Math.sqrt(dx * dx + dy * dy),
      angle = Math.atan2(dy, dx),
      midX = (this.startPoint.x + x) / 2,
      midY = (this.startPoint.y + y) / 2;
    this.previewLine = Matter.Bodies.rectangle(
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
    Matter.World.add(window.BallFall.world, this.previewLine);
    const arrowSize = 20;
    this.arrowPreview = Matter.Bodies.rectangle(x, y, arrowSize, arrowSize, {
      isStatic: true,
      angle: angle,
      render: {
        sprite: { texture: "/images/arrow.png", xScale: 1, yScale: 1 },
        opacity: 0.6,
      },
    });
    Matter.World.add(window.BallFall.world, this.arrowPreview);
  },

  finish(x, y) {
    if (this.previewLine) {
      Matter.World.remove(window.BallFall.world, this.previewLine);
      this.previewLine = null;
    }
    if (this.arrowPreview) {
      Matter.World.remove(window.BallFall.world, this.arrowPreview);
      this.arrowPreview = null;
    }
    const dx = x - this.startPoint.x,
      dy = y - this.startPoint.y,
      distance = Math.sqrt(dx * dx + dy * dy),
      angle = Math.atan2(dy, dx),
      forceScale = 0.0001;
    this.launcherPreview.launchForce = {
      x: Math.cos(angle) * distance * forceScale,
      y: Math.sin(angle) * distance * forceScale,
    };
    if (this.launcherPreview.render && this.launcherPreview.render.sprite) {
      this.launcherPreview.render.opacity = 1;
    }
    this.state = 0;
    this.startPoint = null;
  },

  cancel() {
    if (this.previewLine) {
      Matter.World.remove(window.BallFall.world, this.previewLine);
      this.previewLine = null;
    }
    if (this.arrowPreview) {
      Matter.World.remove(window.BallFall.world, this.arrowPreview);
      this.arrowPreview = null;
    }
    if (this.launcherPreview) {
      Matter.World.remove(window.BallFall.world, this.launcherPreview);
      this.launcherPreview = null;
    }
    this.state = 0;
    this.startPoint = null;
  },

  onTouchStart(x, y) {
    this.onClick(x, y);
  },
  onTouchMove(x, y) {
    this.onMove(x, y);
  },
  onTouchEnd(x, y) {
    if (this.state === 1) this.finish(x, y);
  },
};

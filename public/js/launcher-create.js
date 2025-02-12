/* static/js/launcher-create.js */
window.LauncherCreateTool = {
  state: 0, // 0: waiting for start, 1: waiting for direction
  startPoint: null,
  launcherPreview: null,
  previewLine: null,
  arrowPreview: null,
  // Currently selected launcher type (defaults to "launcher")
  selectedType: "launcher",

  onClick(x, y) {
    if (this.state === 0) {
      this.startPoint = { x, y };
      const size = 40;
      // Assuming the original image is 250px wide, compute scale.
      const scale = size / 250;
      this.launcherPreview = Matter.Bodies.rectangle(x, y, size, size, {
        isStatic: true,
        isSensor: true,
        label: "Launcher",
        render: {
          sprite: {
            texture: App.config.launcherTypes[this.selectedType].image,
            xScale: scale,
            yScale: scale,
          },
          opacity: 0.6,
        },
      });
      // Mark as preview so collisions are ignored
      this.launcherPreview.isPreview = true;
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
      dy = y - this.startPoint.y,
      distance = Math.sqrt(dx * dx + dy * dy),
      angle = Math.atan2(dy, dx);
    // Clamp distance to maxSpeed from config
    const maxSpeed = App.config.launcherTypes[this.selectedType].maxSpeed;
    const clampedDistance = Math.min(distance, maxSpeed);
    const clampedX = this.startPoint.x + Math.cos(angle) * clampedDistance;
    const clampedY = this.startPoint.y + Math.sin(angle) * clampedDistance;

    Matter.Body.setAngle(this.launcherPreview, angle);

    const midX = (this.startPoint.x + clampedX) / 2,
      midY = (this.startPoint.y + clampedY) / 2;
    this.previewLine = Matter.Bodies.rectangle(
      midX,
      midY,
      clampedDistance,
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
    this.arrowPreview = Matter.Bodies.rectangle(
      clampedX,
      clampedY,
      arrowSize,
      arrowSize,
      {
        isStatic: true,
        angle: angle,
        render: {
          sprite: { texture: "images/arrow.png" },
          opacity: 0.6,
        },
      }
    );
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
      angle = Math.atan2(dy, dx);
    // Clamp distance to maxSpeed from config
    const maxSpeed = App.config.launcherTypes[this.selectedType].maxSpeed;
    const clampedDistance = Math.min(distance, maxSpeed);

    Matter.Body.setAngle(this.launcherPreview, angle);
    const forceScale = 0.05;
    this.launcherPreview.launchForce = {
      x: Math.cos(angle) * clampedDistance * forceScale,
      y: Math.sin(angle) * clampedDistance * forceScale,
    };
    this.launcherPreview.delay =
      App.config.launcherTypes[this.selectedType].delay;
    // Optionally store maxSpeed on launcherPreview for later use
    this.launcherPreview.maxSpeed = maxSpeed;
    this.launcherPreview.isPreview = false;
    if (this.launcherPreview.render && this.launcherPreview.render.sprite) {
      this.launcherPreview.render.opacity = 1;
    }
    if (App.modules.lines && typeof App.modules.lines.addLine === "function") {
      App.modules.lines.addLine(this.launcherPreview);
    }
    this.launcherPreview = null;
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

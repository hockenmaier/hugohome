/* static/js/launcher-create.js */
/*
 * launcher-create.js
 * Implements the launcher creation tool.
 * Launchers are drawn by clicking to set a start point, then dragging for direction.
 * Shared math is handled via BaseDrawingTool.
 */
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
      const tool = new BaseDrawingTool("launcher", App.config.costs.launcher);
      if (!tool.canPlace()) {
        BaseDrawingTool.showInsufficientFunds();
        return;
      }
      this.startPoint = { x, y };
      const size = 40;
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
          opacity: 0.6, // preview opacity (will be set to 1 on finish)
        },
      });
      this.launcherPreview.isPreview = true;
      Matter.World.add(window.BallFall.world, this.launcherPreview);
      this.state = 1;
    } else if (this.state === 1) {
      const cost = App.config.costs[this.selectedType];
      const tool = new BaseDrawingTool("launcher", cost);
      // Re-check funds before finishing (desktop flow)
      if (!tool.canPlace()) {
        BaseDrawingTool.showInsufficientFunds();
        this.cancel();
        return;
      }
      this.finish(x, y);
      tool.charge();
    }
  },

  onMove(x, y) {
    if (this.state !== 1) return;
    if (this.previewLine) {
      this.previewLine = BaseDrawingTool.removePreview(this.previewLine);
    }
    if (this.arrowPreview) {
      this.arrowPreview = BaseDrawingTool.removePreview(this.arrowPreview);
    }
    const { dx, dy, midX, midY, angle, length } =
      BaseDrawingTool.computeLineMetrics(this.startPoint, x, y);
    const maxSpeed = App.config.launcherTypes[this.selectedType].maxSpeed;
    const clampedDistance = Math.min(length, maxSpeed);
    const clampedX = this.startPoint.x + Math.cos(angle) * clampedDistance;
    const clampedY = this.startPoint.y + Math.sin(angle) * clampedDistance;

    Matter.Body.setAngle(this.launcherPreview, angle);

    const newMidX = (this.startPoint.x + clampedX) / 2;
    const newMidY = (this.startPoint.y + clampedY) / 2;
    const previewRender = App.config.launcherPreviewRender || {
      fillStyle: "rgba(149,110,255,0.5)",
      strokeStyle: "rgba(149,110,255,0.5)",
      lineWidth: 1,
    };
    this.previewLine = Matter.Bodies.rectangle(
      newMidX,
      newMidY,
      clampedDistance,
      App.config.lineThickness,
      {
        isStatic: true,
        angle: angle,
        render: previewRender,
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
    const { dx, dy, midX, midY, angle, length } =
      BaseDrawingTool.computeLineMetrics(this.startPoint, x, y);
    const maxSpeed = App.config.launcherTypes[this.selectedType].maxSpeed;
    const clampedDistance = Math.min(length, maxSpeed);
    Matter.Body.setAngle(this.launcherPreview, angle);
    const forceScale = 0.05;
    this.launcherPreview.launchForce = {
      x: Math.cos(angle) * clampedDistance * forceScale,
      y: Math.sin(angle) * clampedDistance * forceScale,
    };
    this.launcherPreview.delay =
      App.config.launcherTypes[this.selectedType].delay;
    this.launcherPreview.maxSpeed = maxSpeed;
    this.launcherPreview.isPreview = false;
    // Set to full opacity now that the launcher is placed
    if (this.launcherPreview.render) {
      this.launcherPreview.render.opacity = 1;
    }
    if (App.modules.lines && typeof App.modules.lines.addLine === "function") {
      App.modules.lines.addLine(this.launcherPreview);
    }
    this.launcherPreview.selectedType = this.selectedType;
    let persistentId = App.Persistence.saveLauncher({
      type: "launcher",
      selectedType: this.selectedType,
      startPoint: this.startPoint,
      endPoint: { x, y },
    });
    this.launcherPreview.persistenceId = persistentId;
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
    BaseDrawingTool.prototype.handleTouchStart.call(
      this,
      x,
      y,
      function (x, y) {
        const tool = new BaseDrawingTool("launcher", App.config.costs.launcher);
        if (!tool.canPlace()) {
          BaseDrawingTool.showInsufficientFunds();
          return;
        }
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
      function (x, y) {
        if (this.state === 1) {
          this.finish(x, y);
        }
      },
      this.cancel,
      App.config.costs[this.selectedType]
    );
  },
};

/* static/js/compactor-create.js */
/*
 * compactor-create.js
 * Implements the compactor creation tool.
 * Like the launcher, it uses 2 clicks: first to position,
 * and second to set rotation. The preview shows the compactor image
 * (split into 3 parts) rotating to face the mouse.
 */
window.CompactorCreateTool = {
  state: 0, // 0: waiting for first click, 1: waiting for rotation
  startPoint: null,
  previewComposite: null, // Array of preview bodies (left, middle, right)
  cost: 1000000,

  onClick(x, y) {
    if (this.state === 0) {
      if (App.config.coins < this.cost) {
        BaseDrawingTool.showInsufficientFunds();
        return;
      }
      this.startPoint = { x, y };

      // Define preview dimensions.
      const leftWidth = 50,
        middleWidth = 100,
        rightWidth = 50,
        height = 50;
      const leftX = -(middleWidth / 2 + leftWidth / 2);
      const rightX = middleWidth / 2 + rightWidth / 2;
      const previewOpts = {
        isStatic: true,
        isSensor: true,
        render: { opacity: 0.6 },
      };

      // Create left, middle, and right preview bodies.
      const leftPreview = Matter.Bodies.rectangle(
        x + leftX,
        y,
        leftWidth,
        height,
        Object.assign({}, previewOpts, {
          label: "CompactorLeftPreview",
          render: { sprite: { texture: "images/compactor-left.png" } },
        })
      );
      const middlePreview = Matter.Bodies.rectangle(
        x,
        y,
        middleWidth,
        height,
        Object.assign({}, previewOpts, {
          label: "CompactorMiddlePreview",
          render: { sprite: { texture: "images/compactor-middle.png" } },
        })
      );
      const rightPreview = Matter.Bodies.rectangle(
        x + rightX,
        y,
        rightWidth,
        height,
        Object.assign({}, previewOpts, {
          label: "CompactorRightPreview",
          render: { sprite: { texture: "images/compactor-right.png" } },
        })
      );
      this.previewComposite = [leftPreview, middlePreview, rightPreview];
      Matter.World.add(window.BallFall.world, this.previewComposite);
      this.state = 1;
    } else if (this.state === 1) {
      // Second click: use the current mouse position to determine rotation.
      const dx = x - this.startPoint.x,
        dy = y - this.startPoint.y,
        angle = Math.atan2(dy, dx);
      this.cancelPreview();
      // Create the compactor.
      const compactor = new Compactor(
        { x: this.startPoint.x, y: this.startPoint.y },
        angle
      );
      App.config.coins -= this.cost;
      App.updateCoinsDisplay();
      this.state = 0;
      this.startPoint = null;
    }
  },

  onMove(x, y) {
    if (this.state === 1 && this.previewComposite) {
      const dx = x - this.startPoint.x,
        dy = y - this.startPoint.y,
        angle = Math.atan2(dy, dx);
      const leftWidth = 50,
        middleWidth = 100,
        rightWidth = 50;
      const leftX = -(middleWidth / 2 + leftWidth / 2);
      const rightX = middleWidth / 2 + rightWidth / 2;
      const cos = Math.cos(angle),
        sin = Math.sin(angle);
      const leftOffset = { x: leftX * cos, y: leftX * sin };
      const rightOffset = { x: rightX * cos, y: rightX * sin };
      Matter.Body.setPosition(this.previewComposite[0], {
        x: this.startPoint.x + leftOffset.x,
        y: this.startPoint.y + leftOffset.y,
      });
      Matter.Body.setPosition(this.previewComposite[1], {
        x: this.startPoint.x,
        y: this.startPoint.y,
      });
      Matter.Body.setPosition(this.previewComposite[2], {
        x: this.startPoint.x + rightOffset.x,
        y: this.startPoint.y + rightOffset.y,
      });
      Matter.Body.setAngle(this.previewComposite[0], angle);
      Matter.Body.setAngle(this.previewComposite[1], angle);
      Matter.Body.setAngle(this.previewComposite[2], angle);
    }
  },

  cancelPreview() {
    if (this.previewComposite) {
      this.previewComposite.forEach((body) =>
        Matter.World.remove(window.BallFall.world, body)
      );
      this.previewComposite = null;
    }
  },

  cancel() {
    this.cancelPreview();
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
    if (this.state === 1) this.onClick(x, y);
  },
};

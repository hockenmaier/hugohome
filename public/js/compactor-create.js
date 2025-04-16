/* static/js/compactor-create.js */
/*
 * compactor-create.js
 * Two–click compactor creation.
 * Preview bodies are computed so that the three images maintain their original aspect ratios
 * and have no gap between them.
 */
window.CompactorCreateTool = {
  state: 0,
  startPoint: null,
  previewComposite: null, // Object with keys: left, middle, right
  cost: App.config.compactor.cost,

  onClick(x, y) {
    if (this.state === 0) {
      if (App.config.coins < this.cost) {
        BaseDrawingTool.showInsufficientFunds();
        return;
      }
      this.startPoint = { x, y };

      // Get natural dimensions from global config.
      const natural = App.config.compactor.naturalDimensions;
      const leftNatW = natural.left.width,
        leftNatH = natural.left.height;
      const midNatW = natural.middle.width,
        midNatH = natural.middle.height;
      const rightNatW = natural.right.width,
        rightNatH = natural.right.height;
      const totalNatW = leftNatW + midNatW + rightNatW;
      const targetTotalW =
        App.config.ballSize * App.config.compactor.targetWidthMultiplier;
      const scaleFactor = targetTotalW / totalNatW;
      const targetH = leftNatH * scaleFactor; // same for all parts

      // Use CompactorConfig helper to get open X positions.
      const compactorParams = CompactorConfig.getParams();
      const leftX = compactorParams.leftOpenX;
      const rightX = compactorParams.rightOpenX;

      // Create preview bodies.
      const previewOpts = {
        isStatic: true,
        isSensor: true,
        render: { opacity: 0.6 },
      };
      const leftPreview = Matter.Bodies.rectangle(
        x + leftX,
        y,
        leftNatW * scaleFactor,
        targetH,
        Object.assign({}, previewOpts, {
          label: "CompactorLeftPreview",
          render: {
            sprite: {
              texture: "images/compactor-left.png",
              xScale: scaleFactor,
              yScale: scaleFactor,
            },
          },
        })
      );
      const midPreview = Matter.Bodies.rectangle(
        x,
        y,
        midNatW * scaleFactor,
        targetH,
        Object.assign({}, previewOpts, {
          label: "CompactorMiddlePreview",
          render: {
            sprite: {
              texture: "images/compactor-middle.png",
              xScale: scaleFactor,
              yScale: scaleFactor,
            },
          },
        })
      );
      const rightPreview = Matter.Bodies.rectangle(
        x + rightX,
        y,
        rightNatW * scaleFactor,
        targetH,
        Object.assign({}, previewOpts, {
          label: "CompactorRightPreview",
          render: {
            sprite: {
              texture: "images/compactor-right.png",
              xScale: scaleFactor,
              yScale: scaleFactor,
            },
          },
        })
      );

      this.previewComposite = {
        left: leftPreview,
        middle: midPreview,
        right: rightPreview,
      };
      Matter.World.add(window.BallFall.world, [
        midPreview,
        leftPreview,
        rightPreview,
      ]);
      this.state = 1;
    } else if (this.state === 1) {
      // Second click: determine rotation.
      const dx = x - this.startPoint.x,
        dy = y - this.startPoint.y,
        angle = Math.atan2(dy, dx);
      this.cancelPreview();
      // Create compactor object.
      const compactor = new Compactor(
        { x: this.startPoint.x, y: this.startPoint.y },
        angle
      );
      App.config.coins -= this.cost;
      App.updateCoinsDisplay();
      let compactorId = App.Persistence.saveCompactor({
        position: this.startPoint,
        angle: angle,
      });
      compactor.leftBody.persistenceId = compactorId;
      compactor.middleBody.persistenceId = compactorId;
      compactor.rightBody.persistenceId = compactorId;
      compactor.leftBody.isCompactor = true;
      compactor.middleBody.isCompactor = true;
      compactor.rightBody.isCompactor = true;
      this.state = 0;
      this.startPoint = null;
    }
  },

  onMove(x, y) {
    if (this.state === 1 && this.previewComposite) {
      const dx = x - this.startPoint.x,
        dy = y - this.startPoint.y,
        angle = Math.atan2(dy, dx);
      const compactorParams = CompactorConfig.getParams();
      const leftX = compactorParams.leftOpenX;
      const rightX = compactorParams.rightOpenX;
      const cos = Math.cos(angle),
        sin = Math.sin(angle);
      Matter.Body.setPosition(this.previewComposite.left, {
        x: this.startPoint.x + leftX * cos,
        y: this.startPoint.y + leftX * sin,
      });
      Matter.Body.setAngle(this.previewComposite.left, angle);
      Matter.Body.setPosition(this.previewComposite.middle, {
        x: this.startPoint.x,
        y: this.startPoint.y,
      });
      Matter.Body.setAngle(this.previewComposite.middle, angle);
      Matter.Body.setPosition(this.previewComposite.right, {
        x: this.startPoint.x + rightX * cos,
        y: this.startPoint.y + rightX * sin,
      });
      Matter.Body.setAngle(this.previewComposite.right, angle);
    }
  },

  cancelPreview() {
    if (this.previewComposite) {
      Object.values(this.previewComposite).forEach((body) =>
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

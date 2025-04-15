/* static/js/compactor-create.js */
/*
 * compactor-create.js
 * Two–click compactor creation.
 * The preview is computed so that the three images maintain their original aspect ratios
 * with no gap between them. We assume the natural dimensions for the images are:
 *   left: 100×50, middle: 200×50, right: 100×50.
 * They are scaled so that the overall width equals 5×App.config.ballSize.
 */
window.CompactorCreateTool = {
  state: 0,
  startPoint: null,
  previewComposite: null,
  cost: 1000000,

  onClick(x, y) {
    if (this.state === 0) {
      if (App.config.coins < this.cost) {
        BaseDrawingTool.showInsufficientFunds();
        return;
      }
      this.startPoint = { x, y };

      // Natural image sizes.
      const leftNatW = 100,
        leftNatH = 50;
      const midNatW = 200,
        midNatH = 50;
      const rightNatW = 100,
        rightNatH = 50;
      const totalNatW = leftNatW + midNatW + rightNatW;

      // Desired total width: 5 ball diameters.
      const targetTotalW = App.config.ballSize * 5;
      const scaleFactor = targetTotalW / totalNatW;

      // Scaled dimensions.
      const leftW = leftNatW * scaleFactor;
      const midW = midNatW * scaleFactor;
      const rightW = rightNatW * scaleFactor;
      const targetH = leftNatH * scaleFactor; // same for all

      // Compute centers so that the parts touch:
      // The overall composite center is at (0,0); left center = -(totalNatW/2 - leftNatW/2)*scaleFactor,
      // right center = +(totalNatW/2 - rightNatW/2)*scaleFactor.
      const leftX = -(totalNatW / 2 - leftNatW / 2) * scaleFactor;
      const rightX = (totalNatW / 2 - rightNatW / 2) * scaleFactor;

      const previewOpts = {
        isStatic: true,
        isSensor: true,
        render: { opacity: 0.6 },
      };

      const leftPreview = Matter.Bodies.rectangle(
        x + leftX,
        y,
        leftW,
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
        midW,
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
        rightW,
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

      this.previewComposite = [leftPreview, midPreview, rightPreview];
      Matter.World.add(window.BallFall.world, this.previewComposite);
      this.state = 1;
    } else if (this.state === 1) {
      // Second click determines rotation.
      const dx = x - this.startPoint.x,
        dy = y - this.startPoint.y;
      const angle = Math.atan2(dy, dx);
      this.cancelPreview();
      // Create compactor object.
      const compactor = new Compactor(
        { x: this.startPoint.x, y: this.startPoint.y },
        angle
      );
      App.config.coins -= this.cost;
      App.updateCoinsDisplay();
      // Persist compactor.
      let compactorId = App.Persistence.saveCompactor({
        position: this.startPoint,
        angle: angle,
      });
      compactor.leftBody.persistenceId = compactorId;
      compactor.middleBody.persistenceId = compactorId;
      compactor.rightBody.persistenceId = compactorId;
      // Tag bodies for hover/deletion.
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
        dy = y - this.startPoint.y;
      const angle = Math.atan2(dy, dx);

      // Recompute the offsets as in onClick.
      const leftNatW = 100,
        midNatW = 200,
        rightNatW = 100;
      const totalNatW = leftNatW + midNatW + rightNatW;
      const targetTotalW = App.config.ballSize * 5;
      const scaleFactor = targetTotalW / totalNatW;
      const leftX = -(totalNatW / 2 - leftNatW / 2) * scaleFactor;
      const rightX = (totalNatW / 2 - rightNatW / 2) * scaleFactor;

      // Update positions using the current rotation.
      const cos = Math.cos(angle),
        sin = Math.sin(angle);
      Matter.Body.setPosition(this.previewComposite[0], {
        x: this.startPoint.x + leftX * cos,
        y: this.startPoint.y + leftX * sin,
      });
      Matter.Body.setAngle(this.previewComposite[0], angle);

      Matter.Body.setPosition(this.previewComposite[1], {
        x: this.startPoint.x,
        y: this.startPoint.y,
      });
      Matter.Body.setAngle(this.previewComposite[1], angle);

      Matter.Body.setPosition(this.previewComposite[2], {
        x: this.startPoint.x + rightX * cos,
        y: this.startPoint.y + rightX * sin,
      });
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

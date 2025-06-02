/* static/js/bubblewand-create.js
 * Two-click Bubble-Wand placement (same UX as compactor).
 */
window.BubbleWandCreateTool = {
  state: 0,
  startPoint: null,
  preview: null,
  cost: App.config.costs["bubble-wand"],

  onClick(x, y) {
    if (this.state === 0) {
      if (App.config.coins < this.cost) {
        BaseDrawingTool.showInsufficientFunds();
        return;
      }
      this.startPoint = { x, y };
      const p = BubbleWandConfig.getParams();
      this.preview = Matter.Bodies.circle(x, y, p.radius, {
        isStatic: true,
        isSensor: true,
        render: {
          sprite: {
            texture: "images/bubblewand.png",
            xScale: p.scale,
            yScale: p.scale,
          },
          opacity: 0.6,
        },
        label: "BubbleWandPreview",
      });
      Matter.World.add(window.BallFall.world, this.preview);
      this.state = 1;
    } else {
      // Second click: finish placement.
      const dx = x - this.startPoint.x,
        dy = y - this.startPoint.y,
        angle = Math.atan2(dy, dx);

      Matter.World.remove(window.BallFall.world, this.preview);
      const bwObj = new BubbleWand(this.startPoint, angle);

      /* ---- persistence ---- */
      const id = App.Persistence.saveBubbleWand({
        position: this.startPoint,
        angle: angle,
      });
      if (bwObj && bwObj.body) bwObj.body.persistenceId = id;

      /* ---- charge player ---- */
      App.config.coins -= this.cost;
      App.updateCoinsDisplay();

      /* reset tool */
      this.state = 0;
      this.startPoint = this.preview = null;
    }
  },
  onMove(x, y) {
    if (this.state !== 1 || !this.preview) return;
    const angle = Math.atan2(y - this.startPoint.y, x - this.startPoint.x);
    Matter.Body.setAngle(this.preview, angle);
  },
  cancel() {
    if (this.preview) Matter.World.remove(window.BallFall.world, this.preview);
    this.state = 0;
    this.startPoint = this.preview = null;
  },
  // Mobile wiring
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

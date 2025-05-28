/* static/js/gear-create.js
 * One-click gear placement (desktop: click-click, mobile: tap-drag-release)
 * Behaviour mirrors LauncherCreateTool pattern.
 */
window.GearCreateTool = {
  state: 0,
  previewBody: null,
  selectedType: "gear-cw", // or "gear-ccw"

  cost() {
    return App.config.costs[this.selectedType];
  },

  // ----- desktop handlers -----
  onClick(x, y) {
    const tool = new BaseDrawingTool("gear", this.cost());
    if (!tool.canPlace()) {
      BaseDrawingTool.showInsufficientFunds();
      return;
    }

    if (this.state === 0) {
      this.startPreview(x, y);
      this.state = 1;
    } else {
      this.finish(x, y);
      tool.charge();
    }
  },
  onMove(x, y) {
    if (this.state !== 1 || !this.previewBody) return;
    Matter.Body.setPosition(this.previewBody, { x, y });
  },
  // ----- touch handlers -----
  onTouchStart(x, y) {
    BaseDrawingTool.prototype.handleTouchStart.call(this, x, y, (xx, yy) => {
      this.onClick(xx, yy);
    });
  },
  onTouchMove(x, y) {
    BaseDrawingTool.prototype.handleTouchMove.call(this, x, y, this.onMove);
  },
  onTouchEnd(x, y) {
    BaseDrawingTool.prototype.handleTouchEnd.call(
      this,
      x,
      y,
      this.finish,
      this.cancel,
      this.cost()
    );
  },
  // ----- helpers -----
  startPreview(x, y) {
    const tex = "images/gear-30.png";
    const size = App.config.ballSize * App.config.gearSizeMultiplier; // visually ~8× ball
    const scale = size / 100; // png is 100 px
    this.previewBody = Matter.Bodies.rectangle(x, y, size, size, {
      isStatic: true,
      render: {
        sprite: { texture: tex, xScale: scale, yScale: scale },
        opacity: 0.6,
      },
      label: "GearPreview",
    });
    Matter.World.add(window.BallFall.world, this.previewBody);
  },
  finish(x, y) {
    if (!this.previewBody) return;
    Matter.World.remove(window.BallFall.world, this.previewBody);
    const tex = "images/gear-30.png";
    const sizePx = App.config.ballSize * App.config.gearSizeMultiplier; // overall diameter in px
    const scale = sizePx / 100; // sprite 100 px base

    /* physics parts (invisible) */
    const parts = getScaledGearParts(scale); // circle + 30 teeth

    const body = Matter.Body.create({
      parts,
      isStatic: false, // must be dynamic to rotate
      frictionAir: 0,
      label: "Gear",
      render: { sprite: { texture: tex, xScale: scale, yScale: scale } },
    });
    body.origin = { x, y }; // remember anchor for pin-back
    Matter.Body.setPosition(body, body.origin);
    body.isGear = true;
    body.spinDir = this.selectedType === "gear-cw" ? 1 : -1;

    Matter.World.add(window.BallFall.world, body);

    // persistence
    const id = App.Persistence.saveGear({
      id: null,
      type: this.selectedType,
      x,
      y,
    });
    body.persistenceId = id;

    this.previewBody = null;
    this.state = 0;
  },
  cancel() {
    if (this.previewBody)
      Matter.World.remove(window.BallFall.world, this.previewBody);
    this.previewBody = null;
    this.state = 0;
  },
};

/* static/js/gear-create.js
 * One-click gear placement (desktop: click-click, mobile: tap-drag-release).
 * Follows the launcher/compactor pattern but simpler — no second-action.
 */
window.GearCreateTool = {
  state: 0,
  preview: null,
  selectedType: "gear-cw", // toggled in UI

  cost() {
    return App.config.costs[this.selectedType];
  },

  /* ---------- desktop ---------- */
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
    if (this.state === 1 && this.preview)
      Matter.Body.setPosition(this.preview, { x, y });
  },

  /* ---------- touch ---------- */
  onTouchStart(x, y) {
    BaseDrawingTool.prototype.handleTouchStart.call(this, x, y, (xx, yy) =>
      this.onClick(xx, yy)
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
      this.finish,
      this.cancel,
      this.cost()
    );
  },

  /* ---------- helpers ---------- */
  startPreview(x, y) {
    const size = App.config.ballSize * App.config.gearSizeMultiplier;
    const scale = size / 100;
    this.preview = Matter.Bodies.rectangle(x, y, size, size, {
      isStatic: true,
      isSensor: true,
      render: {
        sprite: { texture: "images/gear-30.png", xScale: scale, yScale: scale },
        opacity: 0.6,
      },
      label: "GearPreview",
    });
    Matter.World.add(window.BallFall.world, this.preview);
  },

  finish(x, y) {
    if (!this.preview) return;
    Matter.World.remove(window.BallFall.world, this.preview);
    this.preview = null;

    const size = App.config.ballSize * App.config.gearSizeMultiplier;
    const scale = size / 100;
    const parts = getScaledGearParts(scale);
    parts.forEach((p) => (p.render.visible = false)); // hide physics parts

    const body = Matter.Body.create({
      parts,
      isStatic: true, // ← real fix: static, no infinite-mass dynamics
      frictionAir: 0,
      label: "Gear",
      render: {
        sprite: { texture: "images/gear-30.png", xScale: scale, yScale: scale },
      },
    });
    body.origin = { x, y };
    body.isGear = true;
    body.spinDir = this.selectedType === "gear-cw" ? 1 : -1;

    Matter.Body.setPosition(body, body.origin);
    Matter.World.add(window.BallFall.world, body);

    // persist & animate
    body.persistenceId = App.Persistence.saveGear({
      type: this.selectedType,
      x,
      y,
    });
    // gear.js will pick it up in the afterAdd hook

    this.state = 0;
  },

  cancel() {
    if (this.preview) Matter.World.remove(window.BallFall.world, this.preview);
    this.preview = null;
    this.state = 0;
  },
};

/* static/js/gear-create.js
 * Places a visible gear sprite plus hidden tooth colliders.
 */
window.GearCreateTool = {
  state: 0,
  preview: null,
  selectedType: "gear-cw",

  price() {
    return App.config.costs[this.selectedType];
  },

  /* ────────── desktop ────────── */
  onClick(x, y) {
    const tool = new BaseDrawingTool("gear", this.price());
    if (!tool.canPlace()) return BaseDrawingTool.showInsufficientFunds();

    if (this.state === 0) {
      this._showPreview(x, y);
      this.state = 1;
    } else {
      this._placeGear(x, y);
      tool.charge();
    }
  },
  onMove(x, y) {
    if (this.state === 1 && this.preview)
      Matter.Body.setPosition(this.preview, { x, y });
  },

  /* ────────── mobile ────────── */
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
      this._placeGear,
      this.cancel,
      this.price()
    );
  },

  /* ────────── helpers ────────── */
  _showPreview(x, y) {
    const size = App.config.ballSize * App.config.gearSizeMultiplier;
    const scale = size / 100;
    this.preview = Matter.Bodies.rectangle(x, y, size, size, {
      isStatic: true,
      isSensor: true,
      label: "GearPreview",
      render: {
        sprite: { texture: "images/gear-30.png", xScale: scale, yScale: scale },
        opacity: 0.6,
      },
    });
    Matter.World.add(window.BallFall.world, this.preview);
  },

  _placeGear(x, y) {
    if (!this.preview) return;
    Matter.World.remove(window.BallFall.world, this.preview);
    this.preview = null;

    const scaleParts =
      (App.config.ballSize * App.config.gearSizeMultiplier) / 100;
    const parts = getScaledGearParts(scaleParts);

    /* hide hub + teeth (parts[0…]) – Render skips parts[0] so we need a visible extra */
    parts.forEach((p) => ((p.render.visible = false), (p.isGear = true)));

    /* extra sensor rectangle that carries the sprite and is actually rendered */
    const spriteScale = scaleParts;
    const imgPart = Matter.Bodies.rectangle(0, 0, 100, 100, {
      // 100×100 base
      isStatic: true,
      isSensor: true,
      label: "GearSprite",
      render: {
        sprite: {
          texture: "images/gear-30.png",
          xScale: spriteScale,
          yScale: spriteScale,
        },
      },
    });
    parts.push(imgPart);

    const body = Matter.Body.create({
      parts,
      isStatic: true,
      frictionAir: 0,
      label: "Gear",
    });
    body.origin = { x, y };
    body.isGear = true;
    body.spinDir = this.selectedType === "gear-cw" ? 1 : -1;
    Matter.Body.setPosition(body, body.origin);
    Matter.World.add(window.BallFall.world, body);

    /* spin immediately */
    if (window.__startGearAnim) window.__startGearAnim(body);

    body.persistenceId = App.Persistence.saveGear({
      type: this.selectedType,
      x,
      y,
    });
    if (App.Achievements && App.Achievements.recordDrawable)
      App.Achievements.recordDrawable();
    this.state = 0;
  },

  cancel() {
    if (this.preview) Matter.World.remove(window.BallFall.world, this.preview);
    this.preview = null;
    this.state = 0;
  },
};

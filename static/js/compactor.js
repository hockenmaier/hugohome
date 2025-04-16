/* static/js/compactor.js */
/*
 * compactor.js
 * Attaches to a placed compactor. Creates three bodies (left, middle, right)
 * with no gaps between them and runs a repeating GSAP timeline:
 *   - idle, crush, shake, then open.
 * Balls are deleted (and their values summed) only during the crush phase.
 * When the crush phase ends, a new ball is spawned immediately at the compactor's center.
 */
(function () {
  // Helper functions to rotate coordinates.
  function rotateX(x, y, angle) {
    return x * Math.cos(angle) - y * Math.sin(angle);
  }
  function rotateY(x, y, angle) {
    return x * Math.sin(angle) + y * Math.cos(angle);
  }

  // Constructor: set position and angle.
  window.Compactor = function (position, angle) {
    this.position = position;
    this.angle = angle;
    const natural = App.config.compactor.naturalDimensions;
    const leftNatW = natural.left.width,
      leftNatH = natural.left.height,
      midNatW = natural.middle.width,
      midNatH = natural.middle.height,
      rightNatW = natural.right.width,
      rightNatH = natural.right.height;
    const totalNatW = leftNatW + midNatW + rightNatW;
    const targetTotalW =
      App.config.ballSize * App.config.compactor.targetWidthMultiplier;
    const scaleFactor = targetTotalW / totalNatW;
    this.leftWidth = leftNatW * scaleFactor;
    this.middleWidth = midNatW * scaleFactor;
    this.rightWidth = rightNatW * scaleFactor;
    this.height = leftNatH * scaleFactor; // all parts share same height

    // Get open positions from config.
    const compactorParams = CompactorConfig.getParams();
    this.leftOpenX = compactorParams.leftOpenX;
    this.rightOpenX = compactorParams.rightOpenX;

    // Closed positions use closedInset from config.
    const inset = App.config.compactor.closedInset || 0;
    this.leftClosedX = -(this.middleWidth + this.leftWidth) / 2 + inset;
    this.rightClosedX = (this.middleWidth + this.rightWidth) / 2 - inset;

    // Starting positions.
    this.leftX = this.leftOpenX;
    this.rightX = this.rightOpenX;

    // Create left, middle, and right bodies.
    // Left and right bodies are now physical (no isSensor) so collisions occur.
    this.leftBody = Matter.Bodies.rectangle(
      position.x + rotateX(this.leftX, 0, angle),
      position.y + rotateY(this.leftX, 0, angle),
      this.leftWidth,
      this.height,
      {
        isStatic: true,
        label: "CompactorLeft",
        angle: angle,
        render: {
          sprite: {
            texture: "images/compactor-left.png",
            xScale: scaleFactor,
            yScale: scaleFactor,
          },
          opacity: 1,
        },
        isCompactor: true,
      }
    );
    // Attach owner reference.
    this.leftBody.compactorOwner = this;

    // Middle remains sensor (for visual only).
    this.middleBody = Matter.Bodies.rectangle(
      position.x,
      position.y,
      this.middleWidth,
      this.height,
      {
        isStatic: true,
        isSensor: true,
        label: "CompactorMiddle",
        angle: angle,
        render: {
          sprite: {
            texture: "images/compactor-middle.png",
            xScale: scaleFactor,
            yScale: scaleFactor,
          },
          opacity: 1,
        },
        isCompactor: true,
      }
    );
    this.rightBody = Matter.Bodies.rectangle(
      position.x + rotateX(this.rightOpenX, 0, angle),
      position.y + rotateY(this.rightOpenX, 0, angle),
      this.rightWidth,
      this.height,
      {
        isStatic: true,
        label: "CompactorRight",
        angle: angle,
        render: {
          sprite: {
            texture: "images/compactor-right.png",
            xScale: scaleFactor,
            yScale: scaleFactor,
          },
          opacity: 1,
        },
        isCompactor: true,
      }
    );
    // Attach owner reference.
    this.rightBody.compactorOwner = this;

    Matter.World.add(window.BallFall.world, [
      this.middleBody,
      this.leftBody,
      this.rightBody,
    ]);

    // Sum of ball values to be replaced.
    this.deletedSum = 0;
    // Flag to allow collision processing only during crush.
    this.isCrushing = false;
    this.handleCollision = this.handleCollision.bind(this);
    Matter.Events.on(
      window.BallFall.engine,
      "collisionStart",
      this.handleCollision
    );
    // Create the GSAP timeline for the compactor animation.
    this.createAnimationTimeline();
  };

  window.Compactor.prototype.createAnimationTimeline = function () {
    const self = this;
    const animProps = { leftX: self.leftX, rightX: self.rightX };
    self.timeline = gsap.timeline({
      repeat: -1,
      onUpdate: () => {
        self.updatePositions(animProps);
      },
    });
    // Idle phase.
    self.timeline.to(animProps, {
      duration: App.config.compactor.timeline.idleDuration,
    });
    // Crush phase: move to closed positions.
    self.timeline.to(animProps, {
      duration: App.config.compactor.timeline.crushDuration,
      ease: "sine.in",
      leftX: self.leftClosedX,
      rightX: self.rightClosedX,
      onStart: () => {
        self.isCrushing = true;
      },
      onComplete: () => {
        // Immediately spawn the ball from crushed value.
        if (self.deletedSum > 0) {
          window.BallFall.spawnBall(self.deletedSum, self.position);
          self.deletedSum = 0;
        }
        self.isCrushing = false;
      },
    });
    // Shake phase.
    self.timeline.to(animProps, {
      duration: App.config.compactor.timeline.shakeDuration,
      repeat: App.config.compactor.timeline.shakeRepeat,
      yoyo: true,
      leftX: self.leftClosedX + 5,
      rightX: self.rightClosedX - 5,
    });
    // Open phase: return to open positions.
    self.timeline.to(animProps, {
      duration: App.config.compactor.timeline.openDuration,
      ease: "linear",
      leftX: self.leftOpenX,
      rightX: self.rightOpenX,
    });
  };

  window.Compactor.prototype.updatePositions = function (props) {
    this.leftX = props.leftX;
    this.rightX = props.rightX;
    const leftPos = {
      x: this.position.x + rotateX(this.leftX, 0, this.angle),
      y: this.position.y + rotateY(this.leftX, 0, this.angle),
    };
    const rightPos = {
      x: this.position.x + rotateX(this.rightX, 0, this.angle),
      y: this.position.y + rotateY(this.rightX, 0, this.angle),
    };
    Matter.Body.setPosition(this.leftBody, leftPos);
    Matter.Body.setPosition(this.rightBody, rightPos);
    Matter.Body.setPosition(this.middleBody, this.position);
  };

  // Only process collisions when isCrushing is true.
  // Use >= 0 for left body and <= 0 for right body for proper math.
  window.Compactor.prototype.handleCollision = function (event) {
    if (!this.isCrushing) return;
    event.pairs.forEach((pair) => {
      let ball = null,
        sensor = null;
      if (
        pair.bodyA.label === "BallFallBall" &&
        (pair.bodyB.label === "CompactorLeft" ||
          pair.bodyB.label === "CompactorRight")
      ) {
        ball = pair.bodyA;
        sensor = pair.bodyB;
      } else if (
        pair.bodyB.label === "BallFallBall" &&
        (pair.bodyA.label === "CompactorLeft" ||
          pair.bodyA.label === "CompactorRight")
      ) {
        ball = pair.bodyB;
        sensor = pair.bodyA;
      }
      if (ball && sensor) {
        // Process only if the sensor belongs to this compactor.
        if (sensor.compactorOwner !== this) return;

        let sensorCenter;
        if (sensor.label === "CompactorLeft") {
          sensorCenter = {
            x: this.position.x + rotateX(this.leftX, 0, this.angle),
            y: this.position.y + rotateY(this.leftX, 0, this.angle),
          };
          const dx = ball.position.x - sensorCenter.x,
            dy = ball.position.y - sensorCenter.y;
          const localX =
            dx * Math.cos(-this.angle) - dy * Math.sin(-this.angle);
          if (localX >= 0 && !ball._compacted) {
            ball._compacted = true;
            if (typeof window.glitchAndRemove === "function") {
              window.glitchAndRemove(ball);
            } else {
              Matter.World.remove(window.BallFall.world, ball);
            }
            const now = Date.now();
            const age = now - (ball.spawnTime || now);
            const base =
              ball.baseValue !== undefined
                ? ball.baseValue
                : App.config.ballStartValue;
            const ballValue =
              base +
              Math.floor(age / App.config.ballIncomeTimeStep) *
                App.config.ballIncomeIncrement;
            this.deletedSum += ballValue;
          }
        } else if (sensor.label === "CompactorRight") {
          sensorCenter = {
            x: this.position.x + rotateX(this.rightX, 0, this.angle),
            y: this.position.y + rotateY(this.rightX, 0, this.angle),
          };
          const dx = ball.position.x - sensorCenter.x,
            dy = ball.position.y - sensorCenter.y;
          const localX =
            dx * Math.cos(-this.angle) - dy * Math.sin(-this.angle);
          if (localX <= 0 && !ball._compacted) {
            ball._compacted = true;
            if (typeof window.glitchAndRemove === "function") {
              window.glitchAndRemove(ball);
            } else {
              Matter.World.remove(window.BallFall.world, ball);
            }
            const now = Date.now();
            const age = now - (ball.spawnTime || now);
            const base =
              ball.baseValue !== undefined
                ? ball.baseValue
                : App.config.ballStartValue;
            const ballValue =
              base +
              Math.floor(age / App.config.ballIncomeTimeStep) *
                App.config.ballIncomeIncrement;
            this.deletedSum += ballValue;
          }
        }
      }
    });
  };
})();

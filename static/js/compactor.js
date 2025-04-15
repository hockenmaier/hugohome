/* static/js/compactor.js */
/*
 * compactor.js
 * Attaches to a placed compactor. Creates three bodies (left, middle, right)
 * with no gaps between them. Runs a repeating GSAP timeline:
 *   - 2 s idle,
 *   - 0.5 s crushing (closing),
 *   - 0.1 s shake,
 *   - 1 s opening.
 * Colliding balls are removed during the closing phase.
 */
(function () {
  function rotateX(x, y, angle) {
    return x * Math.cos(angle) - y * Math.sin(angle);
  }
  function rotateY(x, y, angle) {
    return x * Math.sin(angle) + y * Math.cos(angle);
  }

  // Constructor: position and angle.
  window.Compactor = function (position, angle) {
    this.position = position;
    this.angle = angle;
    // Natural dimensions (same as in compactor-create.js).
    const leftNatW = 100,
      leftNatH = 50;
    const midNatW = 200,
      midNatH = 50;
    const rightNatW = 100,
      rightNatH = 50;
    const totalNatW = leftNatW + midNatW + rightNatW;
    const targetTotalW = App.config.ballSize * 5;
    const scaleFactor = targetTotalW / totalNatW;

    this.leftWidth = leftNatW * scaleFactor;
    this.middleWidth = midNatW * scaleFactor;
    this.rightWidth = rightNatW * scaleFactor;
    this.height = leftNatH * scaleFactor;

    // Compute open positions.
    this.leftOpenX = -(totalNatW / 2 - leftNatW / 2) * scaleFactor;
    this.rightOpenX = (totalNatW / 2 - rightNatW / 2) * scaleFactor;
    // Closed: inner edges meet at center.
    this.leftClosedX = -this.leftWidth / 2;
    this.rightClosedX = this.rightWidth / 2;

    this.leftX = this.leftOpenX;
    this.rightX = this.rightOpenX;

    // Create bodies with sprite scale preserving the aspect ratio.
    this.leftBody = Matter.Bodies.rectangle(
      position.x + rotateX(this.leftX, 0, angle),
      position.y + rotateY(this.leftX, 0, angle),
      this.leftWidth,
      this.height,
      {
        isStatic: true,
        isSensor: true,
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
        isSensor: true,
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
    Matter.World.add(window.BallFall.world, [
      this.middleBody,
      this.leftBody,
      this.rightBody,
    ]);

    this.deletedSum = 0;
    this.isCrushing = false;
    this.handleCollision = this.handleCollision.bind(this);
    Matter.Events.on(
      window.BallFall.engine,
      "collisionStart",
      this.handleCollision
    );
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
    // Idle 2 s.
    self.timeline.to(animProps, { duration: 2 });
    // Crush: close over 0.5 s.
    self.timeline.to(animProps, {
      duration: 0.5,
      ease: "sine.in",
      leftX: self.leftClosedX,
      rightX: self.rightClosedX,
      onStart: () => {
        self.isCrushing = true;
      },
      onComplete: () => {
        self.isCrushing = false;
      },
    });
    // Shake: 0.1 s, 3 repeats yoyo.
    self.timeline.to(animProps, {
      duration: 0.1,
      repeat: 3,
      yoyo: true,
      leftX: self.leftClosedX + 5,
      rightX: self.rightClosedX - 5,
    });
    // Open: release over 1 s.
    self.timeline.to(animProps, {
      duration: 1,
      ease: "linear",
      leftX: self.leftOpenX,
      rightX: self.rightOpenX,
      onComplete: () => {
        if (self.deletedSum > 0) {
          window.BallFall.spawnBall(self.deletedSum);
          self.deletedSum = 0;
        }
      },
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
        const dx = ball.position.x - this.position.x,
          dy = ball.position.y - this.position.y;
        const localX = dx * Math.cos(-this.angle) - dy * Math.sin(-this.angle);
        if (sensor.label === "CompactorLeft") {
          if (localX > this.leftX && !ball._compacted) {
            ball._compacted = true;
            if (typeof window.glitchAndRemove === "function") {
              window.glitchAndRemove(ball);
            } else {
              Matter.World.remove(window.BallFall.world, ball);
            }
            ball.compactValue =
              ball.baseValue !== undefined
                ? ball.baseValue
                : App.config.ballStartValue;
            this.deletedSum += ball.compactValue;
          }
        } else if (sensor.label === "CompactorRight") {
          if (localX < this.rightX && !ball._compacted) {
            ball._compacted = true;
            if (typeof window.glitchAndRemove === "function") {
              window.glitchAndRemove(ball);
            } else {
              Matter.World.remove(window.BallFall.world, ball);
            }
            ball.compactValue =
              ball.baseValue !== undefined
                ? ball.baseValue
                : App.config.ballStartValue;
            this.deletedSum += ball.compactValue;
          }
        }
      }
    });
  };
})();

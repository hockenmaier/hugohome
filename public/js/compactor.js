/* static/js/compactor.js */
/*
 * compactor.js
 * Attaches to a placed compactor object.
 * Creates three Matter bodies (left, middle, right) with colliders on left/right.
 * Sets up a repeating GSAP timeline for the crushing animation:
 *   - Idle for 2 s,
 *   - 0.5 s closing (sine ease-in, during which collisions delete balls and add their values),
 *   - 0.1 s shake (3–4 iterations),
 *   - 1 s reverse (linear) back to the open state.
 * At the end of the cycle, spawns a new ball (using existing spawnBall) with a value equal to the sum of crushed balls.
 */
(function () {
  // Helper functions to rotate a point by angle.
  function rotateX(x, y, angle) {
    return x * Math.cos(angle) - y * Math.sin(angle);
  }
  function rotateY(x, y, angle) {
    return x * Math.sin(angle) + y * Math.cos(angle);
  }

  window.Compactor = function (position, angle) {
    this.position = position;
    this.angle = angle;
    // Dimensions (in pixels – adjust as needed)
    this.leftWidth = 50;
    this.middleWidth = 100;
    this.rightWidth = 50;
    this.height = 50;
    // Open positions: relative x offsets.
    this.leftOpenX = -(this.middleWidth / 2 + this.leftWidth / 2);
    this.rightOpenX = this.middleWidth / 2 + this.rightWidth / 2;
    // Closed positions: left/right pieces move so their inner edges meet center.
    this.leftClosedX = -this.leftWidth / 2;
    this.rightClosedX = this.rightWidth / 2;

    // Start with open positions.
    this.leftX = this.leftOpenX;
    this.rightX = this.rightOpenX;

    // Create left body.
    this.leftBody = Matter.Bodies.rectangle(
      position.x + rotateX(this.leftX, 0, angle),
      position.y + rotateY(this.leftX, 0, angle),
      this.leftWidth,
      this.height,
      {
        isStatic: true,
        isSensor: true,
        label: "CompactorLeft",
        render: {
          sprite: { texture: "images/compactor-left.png" },
          opacity: 1,
        },
      }
    );
    // Create middle body.
    this.middleBody = Matter.Bodies.rectangle(
      position.x,
      position.y,
      this.middleWidth,
      this.height,
      {
        isStatic: true,
        isSensor: true,
        label: "CompactorMiddle",
        render: {
          sprite: { texture: "images/compactor-middle.png" },
          opacity: 1,
        },
      }
    );
    // Create right body.
    this.rightBody = Matter.Bodies.rectangle(
      position.x + rotateX(this.rightOpenX, 0, angle),
      position.y + rotateY(this.rightOpenX, 0, angle),
      this.rightWidth,
      this.height,
      {
        isStatic: true,
        isSensor: true,
        label: "CompactorRight",
        render: {
          sprite: { texture: "images/compactor-right.png" },
          opacity: 1,
        },
      }
    );
    Matter.World.add(window.BallFall.world, [
      this.leftBody,
      this.middleBody,
      this.rightBody,
    ]);

    // Initialize accumulator and crushing flag.
    this.deletedSum = 0;
    this.isCrushing = false;

    // Bind collision handler.
    this.handleCollision = this.handleCollision.bind(this);
    Matter.Events.on(
      window.BallFall.engine,
      "collisionStart",
      this.handleCollision
    );

    // Create the GSAP timeline.
    this.createAnimationTimeline();
  };

  window.Compactor.prototype.createAnimationTimeline = function () {
    const self = this;
    // Object to animate leftX and rightX.
    const animProps = { leftX: self.leftX, rightX: self.rightX };
    self.timeline = gsap.timeline({
      repeat: -1,
      onUpdate: () => {
        self.updatePositions(animProps);
      },
    });
    // Phase 1: Idle 2 sec.
    self.timeline.to(animProps, { duration: 2 });
    // Phase 2: Close in 0.5 sec (sine ease-in). Set crushing flag.
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
    // Phase 3: Shake for 0.1 sec, 3 repeats (yoyo for small offset oscillation).
    self.timeline.to(animProps, {
      duration: 0.1,
      repeat: 3,
      yoyo: true,
      leftX: self.leftClosedX + 5,
      rightX: self.rightClosedX - 5,
    });
    // Phase 4: Release (open) in 1 sec linearly.
    self.timeline.to(animProps, {
      duration: 1,
      ease: "linear",
      leftX: self.leftOpenX,
      rightX: self.rightOpenX,
      onComplete: () => {
        // If any balls were crushed, spawn a new ball with summed value.
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
    // Compute new positions (apply compactor’s rotation).
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

  // During the closing phase, check for ball collisions and delete balls
  // whose positions (transformed into compactor local space) lie toward the center.
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
        // Transform ball position to compactor’s local space.
        const dx = ball.position.x - this.position.x,
          dy = ball.position.y - this.position.y;
        const localX = dx * Math.cos(-this.angle) - dy * Math.sin(-this.angle);
        if (sensor.label === "CompactorLeft") {
          // For left, if ball’s local x is greater than sensor’s center (leftX)
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
          // For right, if ball’s local x is less than sensor’s center (rightX)
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

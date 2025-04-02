/*
 * dotted‐line.js
 * Implements a dotted line tool.
 * Dotted lines use color "#a8328d" and begin with health from App.config.dottedLineHealth (default 5).
 * Each collision with a ball decrements health and updates the dash pattern.
 * When health reaches 0 the line is removed.
 */
(function () {
  // Dash patterns keyed by current health.
  const DASH_PATTERNS = {
    5: [], // full health: drawn as a solid line
    4: [20, 10],
    3: [15, 10],
    2: [10, 10],
    1: [5, 10],
  };

  // Update our custom dash pattern property based on health.
  const updateDashPattern = (body) => {
    body.customDash = DASH_PATTERNS[body.health] || [];
  };

  const DottedLineTool = {
    state: 0,
    firstPoint: null,
    previewLine: null,
    onClick(x, y) {
      if (this.state === 0) {
        this.firstPoint = { x, y };
        this.state = 1;
      } else {
        this.finish(x, y);
      }
    },
    onMove(x, y) {
      if (this.state !== 1) return;
      this.updatePreview(x, y);
    },
    updatePreview(x, y) {
      if (!window.BallFall || !window.BallFall.world) return;
      if (this.previewLine) {
        Matter.World.remove(window.BallFall.world, this.previewLine);
        this.previewLine = null;
      }
      const dx = x - this.firstPoint.x,
        dy = y - this.firstPoint.y,
        length = Math.sqrt(dx * dx + dy * dy),
        angle = Math.atan2(dy, dx),
        midX = (this.firstPoint.x + x) / 2,
        midY = (this.firstPoint.y + y) / 2;
      // For preview, draw a thin outline in the dotted color.
      this.previewLine = Matter.Bodies.rectangle(
        midX,
        midY,
        length,
        App.config.lineThickness,
        {
          isStatic: true,
          angle: angle,
          render: {
            visible: true,
            fillStyle: "transparent",
            strokeStyle: "#a8328d",
            lineWidth: 2, // thinner preview
            lineDash: [],
          },
        }
      );
      Matter.World.add(window.BallFall.world, this.previewLine);
    },
    finish(x, y) {
      if (this.previewLine) {
        Matter.World.remove(window.BallFall.world, this.previewLine);
        this.previewLine = null;
      }
      const dx = x - this.firstPoint.x,
        dy = y - this.firstPoint.y,
        length = Math.sqrt(dx * dx + dy * dy),
        angle = Math.atan2(dy, dx),
        midX = (this.firstPoint.x + x) / 2,
        midY = (this.firstPoint.y + y) / 2;
      // Create the dotted line body. Disable Matter's default drawing.
      const dottedLine = Matter.Bodies.rectangle(
        midX,
        midY,
        length,
        App.config.lineThickness,
        {
          isStatic: true,
          angle: angle,
          label: "DottedLine",
          render: {
            visible: false, // custom rendering only
            fillStyle: "transparent",
            strokeStyle: "#a8328d",
            lineWidth: App.config.lineThickness,
          },
        }
      );
      dottedLine.health = App.config.dottedLineHealth || 5;
      updateDashPattern(dottedLine);
      Matter.World.add(window.BallFall.world, dottedLine);
      if (
        window.App.modules.lines &&
        typeof window.App.modules.lines.addLine === "function"
      ) {
        window.App.modules.lines.addLine(dottedLine);
      }
      this.state = 0;
      this.firstPoint = null;
      if (App.savePlacedObjects) App.savePlacedObjects();
    },
    cancel() {
      if (this.previewLine) {
        Matter.World.remove(window.BallFall.world, this.previewLine);
        this.previewLine = null;
      }
      this.state = 0;
      this.firstPoint = null;
    },
    onTouchStart(x, y) {
      this.onClick(x, y);
    },
    onTouchMove(x, y) {
      this.onMove(x, y);
    },
    onTouchEnd(x, y) {
      this.finish(x, y);
    },
  };

  // Collision handler: decrement health and update dash pattern.
  function registerDottedLineCollision() {
    Matter.Events.on(window.BallFall.engine, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        let dottedLine = null;
        if (
          pair.bodyA.label === "DottedLine" &&
          pair.bodyB.label === "BallFallBall"
        ) {
          dottedLine = pair.bodyA;
        } else if (
          pair.bodyB.label === "DottedLine" &&
          pair.bodyA.label === "BallFallBall"
        ) {
          dottedLine = pair.bodyB;
        }
        if (dottedLine) {
          dottedLine.health--;
          if (dottedLine.health > 0) {
            updateDashPattern(dottedLine);
          } else {
            Matter.World.remove(window.BallFall.world, dottedLine);
          }
          if (App.savePlacedObjects) App.savePlacedObjects();
        }
      });
    });
  }

  // Custom rendering: redraw dotted lines as a complete outline with our dash pattern and a thin stroke.
  function registerDottedLineRender() {
    const render = window.BallFall.render;
    if (!render) return;
    Matter.Events.on(render, "afterRender", function () {
      const context = render.context;
      // Apply the view transform so we draw in world (page) space
      Matter.Render.startViewTransform(render);
      const bodies = Matter.Composite.allBodies(window.BallFall.world);
      bodies.forEach(function (body) {
        if (body.label === "DottedLine") {
          context.save();
          const opacity =
            body.render.opacity !== undefined ? body.render.opacity : 1;
          context.globalAlpha = opacity;
          context.strokeStyle = "#a8328d";
          context.lineWidth = 2;
          context.setLineDash(body.customDash || []);
          context.beginPath();
          const vertices = body.vertices;
          context.moveTo(vertices[0].x, vertices[0].y);
          for (let i = 1; i < vertices.length; i++) {
            context.lineTo(vertices[i].x, vertices[i].y);
          }
          context.closePath();
          context.stroke();
          context.restore();
        }
      });
      Matter.Render.endViewTransform(render);
    });
  }

  if (window.BallFall && window.BallFall.engine) {
    registerDottedLineCollision();
    registerDottedLineRender();
  } else {
    window.addEventListener("BallFallBaseReady", function () {
      registerDottedLineCollision();
      registerDottedLineRender();
    });
  }

  window.DottedLineTool = DottedLineTool;
})();

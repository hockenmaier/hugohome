/* persistent.js - Handles persistence for goal, line, and launcher objects.
   Coins persistence remains unchanged.
*/
(function () {
  App.Persistence = {
    saveGoal: function (goalData) {
      App.Storage.setItem("goal", goalData);
    },
    loadGoal: function () {
      return App.Storage.getItem("goal", null);
    },
    saveLine: function (lineData) {
      let lines = App.Storage.getItem("lines", []);
      lines.push(lineData);
      App.Storage.setItem("lines", lines);
    },
    loadLines: function () {
      return App.Storage.getItem("lines", []);
    },
    saveLauncher: function (launcherData) {
      let launchers = App.Storage.getItem("launchers", []);
      launchers.push(launcherData);
      App.Storage.setItem("launchers", launchers);
    },
    loadLaunchers: function () {
      return App.Storage.getItem("launchers", []);
    },
    rebuildGoal: function () {
      const gd = this.loadGoal();
      if (!gd) return;
      const body = Matter.Bodies.circle(gd.x, gd.y, gd.goalWidth / 2, {
        isStatic: true,
        isSensor: true,
        label: "Goal",
        render: {
          sprite: {
            texture: goalTexture,
            xScale: gd.goalWidth / 100,
            yScale: gd.goalHeight / 100,
          },
          visible: true,
        },
      });
      Matter.World.add(window.BallFall.world, body);
      if (App.modules.goal && typeof App.modules.goal.attach === "function") {
        App.modules.goal.attach(body);
      }
    },
    rebuildLines: function () {
      const lines = this.loadLines();
      if (!lines || !lines.length) return;
      lines.forEach(function (ld) {
        let body;
        if (ld.type === "straight") {
          const dx = ld.p2.x - ld.p1.x,
            dy = ld.p2.y - ld.p1.y,
            length = Math.sqrt(dx * dx + dy * dy),
            angle = Math.atan2(dy, dx),
            midX = (ld.p1.x + ld.p2.x) / 2,
            midY = (ld.p1.y + ld.p2.y) / 2;
          body = Matter.Bodies.rectangle(
            midX,
            midY,
            length,
            App.config.lineThickness,
            {
              isStatic: true,
              angle: angle,
              render: {
                fillStyle: "#956eff",
                strokeStyle: "#956eff",
                lineWidth: 1,
              },
            }
          );
        } else if (ld.type === "curved") {
          body = generateCurveCompoundBody(
            ld.startPoint,
            ld.controlPoint,
            ld.endPoint,
            ld.fidelity || App.config.curvedLineFidelity,
            App.config.lineThickness,
            {
              fillStyle: "#956eff",
              strokeStyle: "#956eff",
              lineWidth: 1,
            }
          );
        }
        if (body) {
          Matter.World.add(window.BallFall.world, body);
          if (
            App.modules.lines &&
            typeof App.modules.lines.addLine === "function"
          ) {
            App.modules.lines.addLine(body);
          }
        }
      });
    },
    rebuildLaunchers: function () {
      const launchers = this.loadLaunchers();
      if (!launchers || !launchers.length) return;
      launchers.forEach(function (ld) {
        // Rebuild launcher similar to how LauncherCreateTool does.
        const size = 40,
          scale = size / 250;
        const body = Matter.Bodies.rectangle(
          ld.startPoint.x,
          ld.startPoint.y,
          size,
          size,
          {
            isStatic: true,
            isSensor: true,
            label: "Launcher",
            render: {
              sprite: {
                texture: App.config.launcherTypes[ld.selectedType].image,
                xScale: scale,
                yScale: scale,
              },
              opacity: 1,
            },
          }
        );
        // Calculate angle and launchForce from stored startPoint and endPoint.
        const dx = ld.endPoint.x - ld.startPoint.x,
          dy = ld.endPoint.y - ld.startPoint.y,
          angle = Math.atan2(dy, dx),
          distance = Math.min(
            Math.sqrt(dx * dx + dy * dy),
            App.config.launcherTypes[ld.selectedType].maxSpeed
          ),
          forceScale = 0.05;
        Matter.Body.setAngle(body, angle);
        body.launchForce = {
          x: Math.cos(angle) * distance * forceScale,
          y: Math.sin(angle) * distance * forceScale,
        };
        body.delay = App.config.launcherTypes[ld.selectedType].delay;
        body.maxSpeed = App.config.launcherTypes[ld.selectedType].maxSpeed;
        body.isPreview = false;
        Matter.World.add(window.BallFall.world, body);
        if (
          App.modules.lines &&
          typeof App.modules.lines.addLine === "function"
        ) {
          App.modules.lines.addLine(body);
        }
      });
    },
  };

  window.addEventListener("BallFallBaseReady", function () {
    App.Persistence.rebuildGoal();
    App.Persistence.rebuildLines();
    App.Persistence.rebuildLaunchers();
  });
})();

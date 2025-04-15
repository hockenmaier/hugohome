/* static/js/persistent.js */
/* Handles per–page persistence for goal, line, launcher, and now compactor objects,
   as well as recurring revenue.
*/
(function () {
  // Generate a unique key per page.
  function pageKey(itemName) {
    let pageId = window.location.pathname.replace(/\//g, "_") || "home";
    return "game." + pageId + "." + itemName;
  }

  App.Persistence = {
    // Goal persistence:
    saveGoal: function (goalData) {
      App.Storage.setItem(pageKey("goal"), goalData);
    },
    loadGoal: function () {
      return App.Storage.getItem(pageKey("goal"), null);
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

    // Line persistence:
    saveLine: function (lineData) {
      if (!lineData.id) {
        lineData.id =
          Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      }
      let lines = App.Storage.getItem(pageKey("lines"), []);
      lines.push(lineData);
      App.Storage.setItem(pageKey("lines"), lines);
      return lineData.id;
    },
    loadLines: function () {
      return App.Storage.getItem(pageKey("lines"), []);
    },
    deleteLine: function (id) {
      let lines = App.Storage.getItem(pageKey("lines"), []);
      lines = lines.filter(function (l) {
        return l.id !== id;
      });
      App.Storage.setItem(pageKey("lines"), lines);
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
          body.persistenceId = ld.id;
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

    // Launcher persistence:
    saveLauncher: function (launcherData) {
      if (!launcherData.id) {
        launcherData.id =
          Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      }
      let launchers = App.Storage.getItem(pageKey("launchers"), []);
      launchers.push(launcherData);
      App.Storage.setItem(pageKey("launchers"), launchers);
      return launcherData.id;
    },
    loadLaunchers: function () {
      return App.Storage.getItem(pageKey("launchers"), []);
    },
    deleteLauncher: function (id) {
      let launchers = App.Storage.getItem(pageKey("launchers"), []);
      launchers = launchers.filter(function (l) {
        return l.id !== id;
      });
      App.Storage.setItem(pageKey("launchers"), launchers);
    },
    rebuildLaunchers: function () {
      const launchers = this.loadLaunchers();
      if (!launchers || !launchers.length) return;
      launchers.forEach(function (ld) {
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
        body.persistenceId = ld.id;
        Matter.World.add(window.BallFall.world, body);
        if (
          App.modules.lines &&
          typeof App.modules.lines.addLine === "function"
        ) {
          App.modules.lines.addLine(body);
        }
      });
    },

    // AutoClicker persistence:
    saveAutoClicker: function (autoData) {
      App.Storage.setItem(pageKey("autoclicker"), autoData);
    },
    loadAutoClicker: function () {
      return App.Storage.getItem(pageKey("autoclicker"), {
        purchased: false,
        maxSpeedLevel: 0,
      });
    },

    // Recurring Revenue persistence:
    saveRecurringRevenue: function (rate) {
      App.Storage.setItem(pageKey("revenue"), rate);
    },
    loadRecurringRevenue: function () {
      return App.Storage.getItem(pageKey("revenue"), null);
    },

    // --- Compactor persistence functions ---
    saveCompactor: function (compactorData) {
      if (!compactorData.id) {
        compactorData.id =
          Date.now() + "-" + Math.random().toString(36).substr(2, 9);
      }
      let compactors = App.Storage.getItem(pageKey("compactors"), []);
      compactors.push(compactorData);
      App.Storage.setItem(pageKey("compactors"), compactors);
      return compactorData.id;
    },
    loadCompactors: function () {
      return App.Storage.getItem(pageKey("compactors"), []);
    },
    deleteCompactor: function (id) {
      let compactors = App.Storage.getItem(pageKey("compactors"), []);
      compactors = compactors.filter(function (c) {
        return c.id !== id;
      });
      App.Storage.setItem(pageKey("compactors"), compactors);
    },
    rebuildCompactors: function () {
      const compactors = this.loadCompactors();
      if (!compactors || !compactors.length) return;
      compactors.forEach(function (cData) {
        const compactor = new Compactor(cData.position, cData.angle);
        compactor.leftBody.persistenceId = cData.id;
        compactor.middleBody.persistenceId = cData.id;
        compactor.rightBody.persistenceId = cData.id;
        // Ensure proper layering by adding the middle first:
        Matter.World.remove(window.BallFall.world, compactor.leftBody);
        Matter.World.remove(window.BallFall.world, compactor.middleBody);
        Matter.World.remove(window.BallFall.world, compactor.rightBody);
        Matter.World.add(window.BallFall.world, [
          compactor.middleBody,
          compactor.leftBody,
          compactor.rightBody,
        ]);
      });
    },
  };

  window.addEventListener("BallFallBaseReady", function () {
    App.Persistence.rebuildGoal();
    App.Persistence.rebuildLines();
    App.Persistence.rebuildLaunchers();
    App.Persistence.rebuildCompactors();
  });
})();

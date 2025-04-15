/* static/js/persistent.js */
(function () {
  function pageKey(itemName) {
    let pageId = window.location.pathname.replace(/\//g, "_") || "home";
    return "game." + pageId + "." + itemName;
  }

  App.Persistence = {
    saveGoal: function (goalData) {
      App.Storage.setItem(pageKey("goal"), goalData);
    },
    loadGoal: function () {
      return App.Storage.getItem(pageKey("goal"), null);
    },
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
    saveAutoClicker: function (autoData) {
      App.Storage.setItem(pageKey("autoclicker"), autoData);
    },
    loadAutoClicker: function () {
      return App.Storage.getItem(pageKey("autoclicker"), {
        purchased: false,
        maxSpeedLevel: 0,
      });
    },
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
    rebuildGoal: function () {
      /* existing code */
    },
    rebuildLines: function () {
      /* existing code */
    },
    rebuildLaunchers: function () {
      /* existing code */
    },
    rebuildCompactors: function () {
      const compactors = App.Persistence.loadCompactors();
      if (!compactors.length) return;
      compactors.forEach(function (cData) {
        const compactor = new Compactor(cData.position, cData.angle);
        compactor.leftBody.persistenceId = cData.id;
        compactor.middleBody.persistenceId = cData.id;
        compactor.rightBody.persistenceId = cData.id;
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

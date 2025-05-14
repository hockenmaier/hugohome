/* static/js/powerup-progression.js
 * Handles permanent upgrade-visibility progression.
 * Any power-up becomes visible forever once the player’s lifetime-max
 * coins ≥ 3 × that power-up’s cost.
 */
(function () {
  // ---------- configurable map ----------
  const defs = {
    curved: { cost: App.config.costs.curved, el: "toggleCurved" },
    launcher: { cost: App.config.costs.launcher, el: "toggleLauncher" },
    "fast-launcher": {
      cost: App.config.costs["fast-launcher"],
      el: "toggleFastLauncher",
    },
    "insta-launcher": {
      cost: App.config.costs["insta-launcher"],
      el: "toggleInstaLauncher",
    },
    compactor: { cost: App.config.compactor.cost, el: "toggleCompactor" },
    // straight & dotted are always visible by design
  };

  // ---------- storage helpers ----------
  const key = "powerUpsUnlocked"; // stored as game.powerUpsUnlocked
  function load() {
    return App.Storage.getItem(key, []);
  }
  function save(arr) {
    App.Storage.setItem(key, arr);
  }

  const unlocked = new Set(load().concat(["straight", "dotted"])); // baseline

  // ---------- dom helpers ----------
  function wrapperFor(elId) {
    const el = document.getElementById(elId);
    return el ? el.closest(".toggle-wrapper") : null;
  }
  function hideLocked() {
    Object.entries(defs).forEach(([name, { el }]) => {
      const w = wrapperFor(el);
      if (w) w.style.display = unlocked.has(name) ? "inline-block" : "none";
    });
  }
  function reveal(name) {
    const def = defs[name];
    if (!def) return;
    unlocked.add(name);
    save(Array.from(unlocked));
    const w = wrapperFor(def.el);
    if (w) w.style.display = "inline-block";
  }

  // ---------- public api ----------
  const PowerUps = {
    init: function () {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", hideLocked);
      } else {
        hideLocked();
      }
    },
    checkUnlocks: function (currCoins) {
      Object.entries(defs).forEach(([name, { cost }]) => {
        if (!unlocked.has(name) && currCoins >= cost * 3) {
          reveal(name);
        }
      });
    },
  };

  // attach to App namespace
  App.PowerUps = PowerUps;
  PowerUps.init();
})();

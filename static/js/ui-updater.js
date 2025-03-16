// ui-updater.js
(function () {
  console.log("running");

  function removeUIColliders() {
    if (!window.BallFall || !window.BallFall.world) {
      return;
    }
    const world = window.BallFall.world;

    // Remove colliders for UI images (all images in #ballfall-ui)
    const uiImgs = document.querySelectorAll(
      "#ballfall-ui img, #spawner-container img"
    );
    uiImgs.forEach(function (img) {
      // Use a copy of the bodies array to avoid iteration issues
      world.bodies.slice().forEach((body) => {
        if (body.elRef === img) {
          Matter.World.remove(world, body);
        }
      });
    });

    // Remove colliders for all UI elements inside #ballfall-ui
    const uiElements = document.querySelectorAll(
      "#ballfall-ui *, #spawner-container *"
    );
    uiElements.forEach(function (elem) {
      world.bodies.slice().forEach((body) => {
        if (body.elRef && elem.contains(body.elRef)) {
          Matter.World.remove(world, body);
        }
      });
    });
  }

  function updateCoinsDisplay() {
    const display = document.getElementById("coins-display");
    if (display) display.textContent = `${App.config.coins} coins`;
  }

  function runUpdater() {
    if (!window.BallFall || !window.BallFall.world) {
      window.addEventListener("BallFallBaseReady", runUpdater);
      return;
    }

    setTimeout(() => {
      updateCoinsDisplay(); // Ensure initial UI matches config value
      removeUIColliders();
    }, 500);

    window.addEventListener("resize", () => {
      setTimeout(() => {
        updateCoinsDisplay();
        removeUIColliders();
      }, 500);
    });
  }

  runUpdater();
})();

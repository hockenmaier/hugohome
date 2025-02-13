// ui-updater.js
(function () {
  /**
   * Remove Matter.js bodies that are linked to UI elements (inside #ballfall-ui).
   */
  console.log("running");
  function removeUIColliders() {
    if (!window.BallFall || !window.BallFall.world) {
      return;
    }
    const world = window.BallFall.world;

    // Remove colliders for UI images (all images in #ballfall-ui)
    const uiImgs = document.querySelectorAll("#ballfall-ui img");
    uiImgs.forEach(function (img) {
      // Use a copy of the bodies array to avoid iteration issues
      world.bodies.slice().forEach((body) => {
        if (body.elRef === img) {
          Matter.World.remove(world, body);
        }
      });
    });

    // Remove colliders for all UI elements inside #ballfall-ui
    const uiElements = document.querySelectorAll("#ballfall-ui *");
    uiElements.forEach(function (elem) {
      world.bodies.slice().forEach((body) => {
        if (body.elRef && elem.contains(body.elRef)) {
          Matter.World.remove(world, body);
        }
      });
    });
  }

  /**
   * Wait for the BallFall engine to be ready before removing UI colliders.
   */
  function runUpdater() {
    if (!window.BallFall || !window.BallFall.world) {
      window.addEventListener("BallFallBaseReady", runUpdater);
      return;
    }

    // Give the UI a moment to render and any colliders to be created.
    setTimeout(removeUIColliders, 500);

    // Optionally, re-run when the window resizes (in case UI elements are re-rendered).
    window.addEventListener("resize", () => {
      setTimeout(removeUIColliders, 500);
    });
  }

  // Run the updater immediately.
  runUpdater();
})();

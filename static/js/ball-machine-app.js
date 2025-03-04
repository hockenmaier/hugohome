window.App = {
  config: {
    spawnInterval: 4480, // Time between ball spawns in ms
    gravity: 0.75,
    timeScale: 0.82,
    restitution: 0.95,
    spawnX: 1.2, // Represents the x axis spawn point of balls where 1/spawnX is the fraction of the screen
    spawnManual: 7, // A new variable representing where the manual click-to spawn should be placed according to the same rules as the autospawner at spawnX
    ballSize: 7,
    sitStillDeleteSeconds: 3,
    sitStillDeleteMargin: 1,

    textHitColor: "#b3ffc7",

    lineThickness: 5, // All line types share this
    dottedLineHealth: 5, // Dotted line health (configurable)
    curvedLineFidelity: 30, // How many sections of the "tube" that is the curved line
    lineDeleteMobileHold: 1200, // Time delay for press and hold to delete on mobile

    launcherTypes: {
      launcher: {
        delay: 750,
        image: window.assetBase + "images/DKannon250.png",
        maxSpeed: 200,
      },
      "fast-launcher": {
        delay: 150,
        image: window.assetBase + "images/DKannon250-fast.png",
        maxSpeed: 350,
      },
      "insta-launcher": {
        delay: 10,
        image: window.assetBase + "images/DKannon250-insta.png",
        maxSpeed: 500,
      },
    },
    coins: 5000, //starting coins and current coins
    costs: {
      straight: 5,
      curved: 20,
      launcher: 50,
      "fast-launcher": 200,
      "insta-launcher": 1000,
    },
    goalMinSpeed: 0.5,
  },
  modules: {},
  init: function () {
    if (this.modules.base) this.modules.base.init();
    if (this.modules.text) this.modules.text.init();
    if (this.modules.lines) this.modules.lines.init();
  },
};

function initApp() {
  App.init();
  if (App.modules.launcher) App.modules.launcher.init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  console.log("running initApp");
  initApp();
}

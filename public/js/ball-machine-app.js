window.App = {
  config: {
    spawnInterval: 4480, // Time between ball spawns in ms
    gravity: 0.75,
    timeScale: 0.3,
    restitution: 0.95,
    spawnX: 1.2, // Represents the x axis spawn point of balls where 1/spawnX is the fraction of the screen
    ballSize: 7,
    sitStillDeleteSeconds: 3,
    sitStillDeleteMargin: 1,

    textHitColor: "#b3ffc7",

    lineThickness: 3, // All line types share this
    curvedLineFidelity: 30, // How many sections of the "tube" that is the curved line
    lineDeleteMobileHold: 1200, // Time delay for press and hold to delete on mobile

    launcherTypes: {
      launcher: { delay: 200, image: "/images/DKannon250.png" },
      "fast-launcher": { delay: 80, image: "/images/DKannon250-fast.png" },
      "insta-launcher": { delay: 10, image: "/images/DKannon250-insta.png" },
    },
    coins: 5, //starting coins and current coins
    goalMinSpeed: 0.8,
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

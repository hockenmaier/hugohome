window.App = {
  config: {
    spawnInterval: 4480, //Time between ball spawns in ms
    gravity: 0.75,
    timeScale: 0.3,
    restitution: 0.95,
    spawnX: 1.2, //Represents the x axis spawn point of balls where 1/spawnX is the fraction of the screen
    ballSize: 7,

    lineThickness: 3, //All line types share this
    curvedLineFidelity: 50, //How many sections of the "tube" that is the curved line
    lineDeleteMobileHold: 1200, //Time delay for press and hold to delete on mobile
  },
  modules: {},
  init: function () {
    if (this.modules.base) this.modules.base.init();
    if (this.modules.text) this.modules.text.init();
    if (this.modules.lines) this.modules.lines.init();
    // Add additional draw modes here, e.g., launcher: this.modules.launcher.init()
  },
};

function initApp() {
  App.init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  console.log("running initApp");
  initApp();
}

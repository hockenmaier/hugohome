window.App = {
    config: {
      spawnInterval: 4480,
      gravity: 0.75,
      timeScale: 0.3,
      restitution: 0.95,
      spawnX: 1.2, //Represents the x axis spawn point of balls where 1/spawnX is the fraction of the screen
      ballSize: 7,
    },
    modules: {},
    init: function() {
      if (this.modules.base) this.modules.base.init();
      if (this.modules.text) this.modules.text.init();
      if (this.modules.lines) this.modules.lines.init();
      // Add additional draw modes here, e.g., launcher: this.modules.launcher.init()
    }
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
  
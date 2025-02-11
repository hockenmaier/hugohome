// app.js
window.App = {
    config: {
      spawnInterval: 4480,
      gravity: 0.75,
      timeScale: 0.3
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
  
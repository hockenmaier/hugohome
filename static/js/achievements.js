(function () {
  const DEFS = [
    {
      id: "minimum_viable_product",
      name: "Minimum Viable Product",
      desc: "Earn your first coin",
    },
    {
      id: "passive_income",
      name: "Passive Income",
      desc: "Begin earning any revenue per second",
    },
    { id: "making_moves", name: "Making Moves", desc: "Reach 10/sec" },
    { id: "side_hustle", name: "Side Hustle", desc: "Reach 100/sec" },
    { id: "startup_mode", name: "Founder Mode", desc: "Reach 1,000/sec" },
    { id: "printing_money", name: "Printing Money", desc: "Reach 10,000/sec" },
    { id: "going_viral", name: "Going Viral", desc: "Reach 100,000/sec" },
    { id: "angel_round", name: "Angel Round", desc: "Reach 1,000,000/sec" },
    { id: "series_z", name: "Series Z", desc: "Reach 10,000,000/sec" },
    {
      id: "exit_strategy",
      name: "Exit Strategy",
      desc: "Reach 100,000,000/sec",
    },
    {
      id: "thousandaire",
      name: "Thousandaire",
      desc: "Earn a total of 1,000 coins",
    },
    {
      id: "millionaire",
      name: "Millionaire",
      desc: "Earn a total of 1,000,000 coins",
    },
    {
      id: "billionaire",
      name: "Billionaire",
      desc: "Earn a total of 1,000,000,000 coins",
    },
    {
      id: "first_taste",
      name: "First Taste",
      desc: "Unlock your first upgrade",
    },
    { id: "on_a_roll", name: "On a Roll", desc: "Unlock 5 upgrades" },
    { id: "completionist", name: "Completionist", desc: "Unlock everything" },
    {
      id: "growth_hacker",
      name: "Growth Hacker",
      desc: "Have 10 pages generating revenue",
    },
    {
      id: "they_grow_up_so_fast",
      name: "They Grow Up So Fast",
      desc: "A ball lives 20+ seconds before scoring",
    },
    {
      id: "seasoned_veteran",
      name: "Seasoned Veteran",
      desc: "A ball lives 1+ minute before scoring",
    },
    {
      id: "the_elder_orb",
      name: "The Elder Orb",
      desc: "A ball lives 5+ minutes before scoring",
    },
    { id: "sketchy_start", name: "Sketchy Start", desc: "Place 50 drawables" },
    { id: "line_cook", name: "Line Cook", desc: "Place 500 drawables" },
    { id: "draw_god", name: "Draw God", desc: "Place 5,000 drawables" },
    {
      id: "night_shift",
      name: "Night Shift",
      desc: "Earn revenue after midnight local time",
    },
    {
      id: "hibernation_mode",
      name: "Hibernation Mode",
      desc: "Close the game tab and return 12 hours later",
    },
    {
      id: "page_turner",
      name: "Page Turner",
      desc: "Scroll through 10 different pages in one session",
    },
    {
      id: "one_tab_army",
      name: "One-Tab Army",
      desc: "Reach 1 million/sec without switching pages",
    },
  ];
  const TOTAL = DEFS.length;
  let unlocked = App.Storage.getItem("achievementsUnlocked", {});
  let lifetimeCoins = App.Storage.getItem("lifetimeCoins", 0);
  let drawables = App.Storage.getItem("drawablesPlaced", 0);

  function save() {
    App.Storage.setItem("achievementsUnlocked", unlocked);
  }
  function saveCoins() {
    App.Storage.setItem("lifetimeCoins", lifetimeCoins);
  }
  function saveDraw() {
    App.Storage.setItem("drawablesPlaced", drawables);
  }

  function updateCounter() {
    const el = document.getElementById("achievement-counter");
    if (el) el.textContent = Object.keys(unlocked).length + "/" + TOTAL;
  }

  function unlock(id) {
    if (unlocked[id]) return;
    unlocked[id] = 1;
    save();
    updateCounter();
  }

  function checkUpgrades() {
    const arr = App.Storage.getItem("powerUpsUnlocked", []);
    const count = arr.length;
    if (count >= 1) unlock("first_taste");
    if (count >= 5) unlock("on_a_roll");
    if (count >= 8) unlock("completionist");
  }

  function checkPages() {
    let pages = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith("game.") && k.endsWith(".revenue")) {
        const r = JSON.parse(localStorage.getItem(k));
        if (r > 0) pages++;
      }
    }
    if (pages >= 10) unlock("growth_hacker");
  }

  function checkReturn() {
    const last = localStorage.getItem("game.lastVisit");
    const now = Date.now();
    if (last && now - Number(last) >= 43200000) unlock("hibernation_mode");
    localStorage.setItem("game.lastVisit", now);
  }

  function checkPagesThisSession() {
    let pages = JSON.parse(sessionStorage.getItem("pagesVisited") || "[]");
    const path = location.pathname;
    if (!pages.includes(path)) {
      pages.push(path);
      sessionStorage.setItem("pagesVisited", JSON.stringify(pages));
    }
    if (pages.length >= 10) unlock("page_turner");
    return pages.length;
  }

  function checkNightShift() {
    const h = new Date().getHours();
    if (h >= 1 && h < 4) unlock("night_shift");
  }

  function checkOneTabArmy(rps) {
    let pages = JSON.parse(sessionStorage.getItem("pagesVisited") || "[]");
    if (pages.length == 1 && rps >= 1000000) unlock("one_tab_army");
  }

  function checkSavedCoins() {
    const coinsHeld = App.config && App.config.coins ? App.config.coins : 0;
    const total = Math.max(lifetimeCoins, coinsHeld);
    if (total > lifetimeCoins) {
      lifetimeCoins = total;
      saveCoins();
    }
    if (total >= 1) unlock("minimum_viable_product");
    if (total >= 1000) unlock("thousandaire");
    if (total >= 1000000) unlock("millionaire");
    if (total >= 1000000000) unlock("billionaire");
  }

  function checkSavedRps() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith("game.") && k.endsWith(".revenue")) {
        const r = JSON.parse(localStorage.getItem(k));
        total += Number(r) || 0;
      }
    }
    if (total > 0) checkRps(total);
  }

  function init() {
    updateCounter();
    checkReturn();
    checkPagesThisSession();
    checkPages();
    checkUpgrades();
    checkSavedCoins();
    checkSavedRps();
  }

  App.Achievements = {
    defs: DEFS,
    init,
    recordDrawable: function () {
      drawables++;
      saveDraw();
      if (drawables >= 50) unlock("sketchy_start");
      if (drawables >= 500) unlock("line_cook");
      if (drawables >= 5000) unlock("draw_god");
    },
    checkBallLifetime: function (sec) {
      if (sec >= 20) unlock("they_grow_up_so_fast");
      if (sec >= 60) unlock("seasoned_veteran");
      if (sec >= 300) unlock("the_elder_orb");
    },
    checkRps: function (rps) {
      if (rps > 0) unlock("passive_income");
      if (rps >= 10) unlock("making_moves");
      if (rps >= 100) unlock("side_hustle");
      if (rps >= 1000) unlock("startup_mode");
      if (rps >= 10000) unlock("printing_money");
      if (rps >= 100000) unlock("going_viral");
      if (rps >= 1000000) {
        unlock("angel_round");
        checkOneTabArmy(rps);
      }
      if (rps >= 10000000) unlock("series_z");
      if (rps >= 100000000) unlock("exit_strategy");
    },
    onCoinsChange: function (delta) {
      if (delta > 0) {
        lifetimeCoins += delta;
        saveCoins();
        if (lifetimeCoins >= 1) unlock("minimum_viable_product");
        if (lifetimeCoins >= 1000) unlock("thousandaire");
        if (lifetimeCoins >= 1000000) unlock("millionaire");
        if (lifetimeCoins >= 1000000000) unlock("billionaire");
        checkNightShift();
        checkUpgrades();
      }
    },
    checkNightShift: checkNightShift,
    checkPages: checkPages,
    checkOneTabArmy: checkOneTabArmy,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

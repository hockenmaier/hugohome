This is the code before the lines and base drawing tool refactor. The files "inputManager.js and line-interaction.js don't exist because all of this generic functionality was included within the tool code itself
Use this for reference of all of the features including small QOL features that existed before the major line refactor that pulled redundant code into base-drawing-tool, inputManager, line-interaction, and others. Notice also that style information was not contained in ball-machine-app.js previously, as it is now.

----- static\js\ball-machine-app.js -----
/\*

- ball-machine-app.js
- Main app configuration and initialization.
  \*/
  window.App = {
  config: {
  spawnInterval: 4480, // Default ball spawn interval in ms (auto-clicker rate)
  gravity: 0.75,
  timeScale: 0.82,
  restitution: 0.95,
  spawnX: 1.3, // x axis spawn point: 1/spawnX is the fraction of the screen width
  ballSize: 7,
  sitStillDeleteSeconds: 3,
  sitStillDeleteMargin: 1,
  disableDuration: 800, // milliseconds
  textHitColor: "#b3ffc7",
  lineThickness: 5,
  dottedLineHealth: 5,
  curvedLineFidelity: 30,
  lineDeleteMobileHold: 1200,
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
  coins: 250, //Default for when app first loads and there's no storage
  costs: {
  straight: 5,
  curved: 20,
  launcher: 50,
  "fast-launcher": 200,
  "insta-launcher": 1000,
  },
  goalMinSpeed: 0.5,
  // New economy clicker settings:
  spawnCooldown: 250, // 0.25 sec cooldown between manual spawns
  autoClickerCost: 20, // Cost to unlock auto spawner
  speedUpgradeCosts: {
  1: 50,
  2: 100,
  3: 200,
  4: 400,
  5: 1600,
  6: 3200,
  7: 6400,
  8: 12800,
  9: 25600,
  10: 51200,
  11: 100000,
  },
  maxUnlockedSpeedLevel: 0, // Initially 0; increases with upgrades
  autoClicker: false, // Flag set when auto-clicker is purchased
  originalSpawnInterval: 4480, // To compute speed upgrades

      // --- New goal income settings ---
      goalDefaultIncome: 1, // Default coins earned when goal spawns at base position
      goalIncomeStepDesktop: 300, // Additional coin per 300px beyond base in desktop mode
      goalIncomeStepMobile: 500, // Additional coin per 500px beyond base in mobile mode
      goalBaseSpawnYDesktop: 300, // Base spawn Y for desktop mode (independent variable for income)
      goalBaseSpawnYMobile: 500, // Base spawn Y for mobile mode

  },
  modules: {},
  simulationLoaded: false, // Tracks whether the physics simulation is running

// startSimulation loads Matter.js, text colliders, etc.
// In static/js/ball-machine-app.js
// In static/js/ball-machine-app.js
startSimulation: function () {
if (window.App.simulationLoaded) return;
window.App.simulationLoaded = true;
// Initialize simulation modules – preserving existing comments.
if (window.App.modules.base) window.App.modules.base.init();
if (window.App.modules.text) window.App.modules.text.init();
if (window.App.modules.lines) window.App.modules.lines.init();
if (window.App.modules.launcher) window.App.modules.launcher.init();

    // Load auto-clicker state for this page from persistent storage.
    if (
      App.Persistence &&
      typeof App.Persistence.loadAutoClicker === "function"
    ) {
      var autoData = App.Persistence.loadAutoClicker();
      if (autoData && autoData.purchased) {
        App.config.autoClicker = true;
        App.config.maxUnlockedSpeedLevel = autoData.maxSpeedLevel;
        var newInterval =
          App.config.originalSpawnInterval /
          Math.pow(2, autoData.maxSpeedLevel);
        App.config.spawnInterval = newInterval;
        window.BallFall.updateSpawnInterval(newInterval);
        window.BallFall.startAutoSpawner();
        // Update the cost display so it reflects the proper next upgrade cost.
        if (App.updateAutoClickerCostDisplay) {
          App.updateAutoClickerCostDisplay();
        }
      }
    }

    // Show the game UI (it is hidden by default in the HTML)
    const ui = document.getElementById("ballfall-ui");
    if (ui) ui.style.display = "block";

    // Show auto clicker upgrade button and its cost only after simulation loads.
    const autoClickerBtn = document.getElementById("autoClicker");
    if (autoClickerBtn) {
      autoClickerBtn.style.display = "block";
      const autoClickerCost = document.getElementById("autoClickerCost");
      if (autoClickerCost) autoClickerCost.style.display = "block";
    }

    window.addEventListener("scroll", function updateCamera() {
      if (window.BallFall && window.BallFall.render) {
        Matter.Render.lookAt(window.BallFall.render, {
          min: { x: window.scrollX, y: window.scrollY },
          max: {
            x: window.scrollX + window.innerWidth,
            y: window.scrollY + window.innerHeight,
          },
        });
      }
    });

},

init: function () {
// No auto-init; simulation is started via user click on spawner.
},
};

function initApp() {
App.init();
}

if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", initApp);
} else {
initApp();
}

// --- Begin persistent storage module and update functions ---
if (window.localStorage) {
// Initialize persistent coins using our new storage module
// If a saved value exists, load it; otherwise, save the default value.
App.Storage = {
namespace: "game",
getKey: function (itemName) {
return this.namespace + "." + itemName;
},
getItem: function (itemName, defaultValue) {
var key = this.getKey(itemName);
var val = localStorage.getItem(key);
return val !== null ? JSON.parse(val) : defaultValue;
},
setItem: function (itemName, value) {
var key = this.getKey(itemName);
localStorage.setItem(key, JSON.stringify(value));
},
};

// Load coins from persistent storage or use default
App.config.coins = App.Storage.getItem("coins", App.config.coins);
}

App.updateCoinsDisplay = function () {
const display = document.getElementById("coins-display");
if (display) display.textContent = `${App.config.coins} coins`;
if (App.Storage) {
App.Storage.setItem("coins", App.config.coins);
//App.Storage.setItem("coins", 2000); //Use for adding coins to storage
}
};
// --- End persistent storage module and update functions ---

----- static\js\base-drawing-tool.js -----
/_ static/js/base-drawing-tool.js _/
class BaseDrawingTool {
constructor(toolName, cost) {
this.toolName = toolName;
this.cost = cost;
}
canPlace() {
return App.config.coins >= this.cost;
}
charge() {
App.config.coins -= this.cost;
App.updateCoinsDisplay();
}
// static updateCoinsDisplay() {
// const display = document.getElementById("coins-display");
// if (display) display.textContent = `${App.config.coins} coins`;
// }
static showInsufficientFunds() {
// Now calls the centralized unaffordable notification routine.
window.notifyUnaffordable(100, 12);
}
}
window.BaseDrawingTool = BaseDrawingTool;

----- static\js\lines.js -----
// This is the base class for all of the "drawn powerups"
// (existing comments preserved)
App.modules.lines = (function () {
let mode = "straight";
let lastFinishTime = 0; // NEW: Timestamp of last finish to block immediate new click

function setMode(newMode) {
mode = newMode;
if (
window.CurvedLineTool &&
typeof window.CurvedLineTool.cancel === "function" &&
mode !== "curved"
)
window.CurvedLineTool.cancel();
if (
StraightLineTool &&
typeof StraightLineTool.cancel === "function" &&
mode !== "straight"
)
StraightLineTool.cancel();
if (
window.LauncherCreateTool &&
typeof LauncherCreateTool.cancel === "function" &&
mode !== "launcher"
)
LauncherCreateTool.cancel();
if (
window.DottedLineTool &&
typeof DottedLineTool.cancel === "function" &&
mode !== "dotted"
)
DottedLineTool.cancel();

    if (window.innerWidth < 720) {
      if (newMode !== "none") {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }

}

function getMode() {
return mode;
}
function addLine(body) {
body.isLine = true;
}
function getLineAtPoint(x, y) {
const point = { x, y };
if (!window.BallFall || !window.BallFall.world) return null;
const bodies = Matter.Composite.allBodies(window.BallFall.world);
for (let body of bodies) {
if (body.isLine) {
if (body.label === "CurvedLine" || body.label === "Launcher") {
for (let part of body.parts) {
if (Matter.Vertices.contains(part.vertices, point)) return body;
}
} else if (body.parts && body.parts.length > 1) {
for (let i = 1; i < body.parts.length; i++) {
if (Matter.Vertices.contains(body.parts[i].vertices, point))
return body;
}
} else {
if (Matter.Vertices.contains(body.vertices, point)) return body;
}
}
}
return null;
}

let hoveredLine = null;
let pendingDeletionLine = null;
let deletionTimer = null;
let touchStartPos = null;

// Reset a line's style to default.
function resetLine(body) {
if (!body) return;
if (body.label === "Launcher" && body.render) {
if (body.render.sprite) body.render.sprite.opacity = 1;
body.render.opacity = 1;
} else if (body.label === "DottedLine") {
if (body.render) {
body.render.fillStyle = "#a8328d";
body.render.strokeStyle = "#a8328d";
body.render.opacity = 1;
}
} else if (body.parts && body.parts.length > 1) {
body.parts.forEach((part) => {
part.render.fillStyle = "#956eff";
part.render.strokeStyle = "#956eff";
});
} else if (body.render) {
body.render.fillStyle = "#956eff";
body.render.strokeStyle = "#956eff";
}
}

let lastHovered = null;
let hoveredLineStartTime = null;
let pendingDeletionLineStartTime = null;

function updatePulse() {
function applyPulse(body, opacity) {
if (body.label === "Launcher" && body.render && body.render.sprite) {
body.render.sprite.opacity = opacity;
body.render.opacity = opacity;
} else if (body.parts && body.parts.length > 1) {
body.parts.forEach((part) => {
part.render.opacity = opacity;
});
} else if (body.render) {
body.render.opacity = opacity;
}
}
function reset(body) {
if (body.label === "Launcher" && body.render && body.render.sprite) {
body.render.sprite.opacity = 1;
body.render.opacity = 1;
} else if (body.parts && body.parts.length > 1) {
body.parts.forEach((part) => {
part.render.opacity = 1;
});
} else if (body.render) {
body.render.opacity = 1;
}
}
if (hoveredLine) {
if (!hoveredLineStartTime) hoveredLineStartTime = Date.now();
const elapsed = Date.now() - hoveredLineStartTime;
const t = (Math.sin(elapsed / 75 + Math.PI / 2) + 1) / 2;
const opacity = 0.2 + 0.8 _ t;
applyPulse(hoveredLine, opacity);
lastHovered = hoveredLine;
} else if (lastHovered) {
reset(lastHovered);
lastHovered = null;
hoveredLineStartTime = null;
}
if (pendingDeletionLine && pendingDeletionLine !== hoveredLine) {
if (!pendingDeletionLineStartTime)
pendingDeletionLineStartTime = Date.now();
const elapsed = Date.now() - pendingDeletionLineStartTime;
const t = (Math.sin(elapsed / 75 + Math.PI / 2) + 1) / 2;
const opacity = 0.2 + 0.8 _ t;
applyPulse(pendingDeletionLine, opacity);
} else {
pendingDeletionLineStartTime = null;
}
requestAnimationFrame(updatePulse);
}
updatePulse();

// StraightLineTool definition with modified finish().
const StraightLineTool = {
state: 0,
firstPoint: null,
previewLine: null,
onClick(x, y) {
const tool = new BaseDrawingTool("straight", App.config.costs.straight);
if (!tool.canPlace()) {
BaseDrawingTool.showInsufficientFunds();
return;
}
if (this.state === 0) {
this.firstPoint = { x, y };
this.state = 1;
} else {
this.finish(x, y);
tool.charge();
}
},
onMove(x, y) {
if (this.state !== 1) return;
this.updatePreview(x, y);
},
updatePreview(x, y) {
if (!window.BallFall || !window.BallFall.world) return;
if (this.previewLine) {
Matter.World.remove(window.BallFall.world, this.previewLine);
this.previewLine = null;
}
const dx = x - this.firstPoint.x,
dy = y - this.firstPoint.y,
length = Math.sqrt(dx _ dx + dy _ dy),
angle = Math.atan2(dy, dx),
midX = (this.firstPoint.x + x) / 2,
midY = (this.firstPoint.y + y) / 2;
this.previewLine = Matter.Bodies.rectangle(
midX,
midY,
length,
App.config.lineThickness,
{
isStatic: true,
angle: angle,
render: {
fillStyle: "rgba(149,110,255,0.5)",
strokeStyle: "rgba(149,110,255,0.5)",
lineWidth: 1,
},
}
);
Matter.World.add(window.BallFall.world, this.previewLine);
},
finish(x, y) {
if (this.previewLine) {
Matter.World.remove(window.BallFall.world, this.previewLine);
this.previewLine = null;
}
const dx = x - this.firstPoint.x,
dy = y - this.firstPoint.y,
length = Math.sqrt(dx _ dx + dy _ dy),
angle = Math.atan2(dy, dx),
midX = (this.firstPoint.x + x) / 2,
midY = (this.firstPoint.y + y) / 2;
const lineBody = Matter.Bodies.rectangle(
midX,
midY,
length,
App.config.lineThickness,
{
isStatic: true,
angle: angle,
render: {
fillStyle: "#956eff",
strokeStyle: "#956eff",
lineWidth: 1,
},
}
);
Matter.World.add(window.BallFall.world, lineBody);
addLine(lineBody);
// Persist the straight line using its endpoints and capture the persistent id.
let persistentId = App.Persistence.saveLine({
type: "straight",
p1: this.firstPoint,
p2: { x: x, y: y },
});
lineBody.persistenceId = persistentId;
this.state = 0;
this.firstPoint = null;
// Mark the finish time to block immediate new clicks.
lastFinishTime = Date.now();
},

    cancel() {
      if (this.previewLine) {
        Matter.World.remove(window.BallFall.world, this.previewLine);
        this.previewLine = null;
      }
      this.state = 0;
      this.firstPoint = null;
    },
    onTouchStart(x, y) {
      this.onClick(x, y);
    },
    onTouchMove(x, y) {
      this.onMove(x, y);
    },
    onTouchEnd(x, y) {
      this.finish(x, y);
      new BaseDrawingTool("straight", App.config.costs.straight).charge();
    },

};

// Helper to get the current active tool based on mode.
function getActiveTool() {
switch (mode) {
case "straight":
return StraightLineTool;
case "curved":
return window.CurvedLineTool;
case "launcher":
return window.LauncherCreateTool;
case "dotted":
return window.DottedLineTool;
default:
return null;
}
}

// Global desktop event handlers.
document.addEventListener("mousemove", (e) => {
const mouseX = e.pageX,
mouseY = e.pageY;
let tool = getActiveTool();
if (tool && typeof tool.onMove === "function") {
tool.onMove(mouseX, mouseY);
}
const line = getLineAtPoint(mouseX, mouseY);
if (line) {
if (hoveredLine !== line) {
if (hoveredLine) resetLine(hoveredLine);
hoveredLine = line;
}
document.body.style.cursor = "pointer";
} else {
if (hoveredLine) {
resetLine(hoveredLine);
hoveredLine = null;
}
document.body.style.cursor = "";
}
});

document.addEventListener("contextmenu", (e) => {
const mouseX = e.pageX,
mouseY = e.pageY;
let tool = getActiveTool();
if (tool && tool.state && tool.state !== 0) {
if (typeof tool.cancel === "function") tool.cancel();
e.preventDefault();
return;
}
const line = getLineAtPoint(mouseX, mouseY);
if (line) {
Matter.World.remove(window.BallFall.world, line);
// Remove the persistent record.
if (line.label === "Launcher") {
if (line.persistenceId)
App.Persistence.deleteLauncher(line.persistenceId);
} else {
if (line.persistenceId) App.Persistence.deleteLine(line.persistenceId);
}
e.preventDefault();
}
});

// Global click handler that blocks clicks if within 200ms of a finish.
document.addEventListener(
"click",
(e) => {
if (Date.now() - lastFinishTime < 200) return;
if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
return;
if (e.target.closest("#toggle-container")) return;
const tool = getActiveTool();
const uiElement =
e.target.closest("#ballfall-ui") ||
e.target.closest("#spawner-container");
const linkEl = e.target.closest("a");
if (linkEl && !uiElement && tool) {
e.preventDefault();
flashElementStyle(
linkEl,
["color", "textDecoration"],
{ color: "red", textDecoration: "line-through" },
100,
6
);
const toggleGroup = document.getElementById("toggle-container");
if (toggleGroup) {
flashElementStyle(
toggleGroup,
["border"],
{ border: "2px solid red" },
100,
6
);
}
}
if (uiElement && (!tool || tool.state === 0)) {
return;
}
const clickX = e.pageX,
clickY = e.pageY;
if (tool && typeof tool.onClick === "function") {
tool.onClick(clickX, clickY);
}
},
true
);

// Mobile touch events (unchanged).
document.addEventListener("touchstart", (e) => {
if (e.target.closest("#ballfall-ui")) return;
if (e.touches.length !== 1) return;
const touch = e.touches[0],
touchX = touch.pageX,
touchY = touch.pageY;
const line = getLineAtPoint(touchX, touchY);
if (line) {
touchStartPos = { x: touchX, y: touchY };
pendingDeletionLine = line;
deletionTimer = setTimeout(() => {
Matter.World.remove(window.BallFall.world, line);
// Remove persistent record on mobile deletion.
if (line.label === "Launcher") {
if (line.persistenceId)
App.Persistence.deleteLauncher(line.persistenceId);
} else {
if (line.persistenceId)
App.Persistence.deleteLine(line.persistenceId);
}
pendingDeletionLine = null;
}, App.config.lineDeleteMobileHold);
} else {
let tool = getActiveTool();
if (tool && typeof tool.onTouchStart === "function") {
tool.onTouchStart(touchX, touchY);
}
}
});

document.addEventListener("touchmove", (e) => {
if (e.target.closest("#ballfall-ui")) return;
if (e.touches.length !== 1) return;
const touch = e.touches[0],
touchX = touch.pageX,
touchY = touch.pageY;
let tool = getActiveTool();
if (tool && typeof tool.onTouchMove === "function") {
tool.onTouchMove(touchX, touchY);
}
if (touchStartPos) {
const dx = touchX - touchStartPos.x,
dy = touchY - touchStartPos.y;
if (Math.sqrt(dx _ dx + dy _ dy) > 10) {
clearTimeout(deletionTimer);
deletionTimer = null;
if (pendingDeletionLine) resetLine(pendingDeletionLine);
pendingDeletionLine = null;
touchStartPos = null;
}
}
});

document.addEventListener("touchend", (e) => {
if (e.target.closest("#ballfall-ui")) return;
const touch = e.changedTouches[0],
touchX = touch.pageX,
touchY = touch.pageY;
let tool = getActiveTool();
if (tool && typeof tool.onTouchEnd === "function") {
tool.onTouchEnd(touchX, touchY);
}
if (pendingDeletionLine) {
clearTimeout(deletionTimer);
deletionTimer = null;
resetLine(pendingDeletionLine);
pendingDeletionLine = null;
touchStartPos = null;
}
});

function init() {
if (window.BallFall && window.BallFall.engine) {
/_ Ready _/
} else {
window.addEventListener("BallFallBaseReady", function () {});
}
}

return { init, setMode, getMode, addLine };
})();

----- static\js\curved-line.js -----
window.CurvedLineTool = {
state: 0, // 0: waiting for start, 1: waiting for end, 2: waiting for control
startPoint: null,
endPoint: null,
previewCompound: null,

// Desktop click-based methods
onClick(x, y) {
if (this.state === 0) {
const tool = new BaseDrawingTool("curved", App.config.costs.curved);
if (!tool.canPlace()) {
BaseDrawingTool.showInsufficientFunds();
return;
}
this.startPoint = { x, y };
this.state = 1;
} else if (this.state === 1) {
this.endPoint = { x, y };
this.state = 2;
} else if (this.state === 2) {
this.finish(x, y);
new BaseDrawingTool("curved", App.config.costs.curved).charge();
}
},

onMove(x, y) {
if (this.state === 0) return;
if (this.state === 1) {
// Show a straight-line preview (as a rectangle) between startPoint and current pointer.
if (this.previewCompound) {
Matter.World.remove(window.BallFall.world, this.previewCompound);
this.previewCompound = null;
}
const dx = x - this.startPoint.x,
dy = y - this.startPoint.y,
midX = (this.startPoint.x + x) / 2,
midY = (this.startPoint.y + y) / 2,
angle = Math.atan2(dy, dx),
length = Math.sqrt(dx _ dx + dy _ dy);
this.previewCompound = Matter.Bodies.rectangle(
midX,
midY,
length,
App.config.lineThickness _ 1.05,
{
isStatic: true,
angle: angle,
render: {
fillStyle: "rgba(149,110,255,0.5)",
strokeStyle: "rgba(149,110,255,0.5)",
lineWidth: 1,
},
}
);
Matter.World.add(window.BallFall.world, this.previewCompound);
} else if (this.state === 2) {
// In control phase, use current pointer as the control point and preview a compound curved body.
if (this.previewCompound) {
Matter.World.remove(window.BallFall.world, this.previewCompound);
this.previewCompound = null;
}
// The current pointer (x,y) serves as the control point.
this.previewCompound = generateCurveCompoundBody(
this.startPoint,
{ x, y },
this.endPoint,
App.config.curvedLineFidelity,
App.config.lineThickness _ 1.05,
{
fillStyle: "rgba(149,110,255,0.5)",
strokeStyle: "rgba(149,110,255,0.5)",
lineWidth: 1,
}
);
Matter.World.add(window.BallFall.world, this.previewCompound);
}
},

finish(controlX, controlY) {
if (this.previewCompound) {
Matter.World.remove(window.BallFall.world, this.previewCompound);
this.previewCompound = null;
}
const compound = generateCurveCompoundBody(
this.startPoint,
{ x: controlX, y: controlY },
this.endPoint,
App.config.curvedLineFidelity,
App.config.lineThickness \* 1.05,
{
fillStyle: "#956eff",
strokeStyle: "#956eff",
lineWidth: 1,
}
);
Matter.World.add(window.BallFall.world, compound);
if (window.App.modules.lines && window.App.modules.lines.addLine)
window.App.modules.lines.addLine(compound);
// Save the curved line with its defining points and capture the persistent id.
let persistentId = App.Persistence.saveLine({
type: "curved",
startPoint: this.startPoint,
endPoint: this.endPoint,
controlPoint: { x: controlX, y: controlY },
fidelity: App.config.curvedLineFidelity,
});
compound.persistenceId = persistentId;
this.state = 0;
this.startPoint = null;
this.endPoint = null;
if (
App.modules.lines &&
typeof App.modules.lines.setIgnoreNextClick === "function"
) {
App.modules.lines.setIgnoreNextClick(true);
}
},

cancel() {
if (this.previewCompound) {
Matter.World.remove(window.BallFall.world, this.previewCompound);
this.previewCompound = null;
}
this.state = 0;
this.startPoint = null;
this.endPoint = null;
},

// Mobile touch methods mirror desktop behavior.
// In curved-line.js, update the mobile methods:
// Mobile touch methods for CurvedLineTool in curved-line.js
onTouchStart(x, y) {
if (this.state === 0) {
const tool = new BaseDrawingTool("curved", App.config.costs.curved);
if (!tool.canPlace()) {
BaseDrawingTool.showInsufficientFunds();
return;
}
this.startPoint = { x, y };
this.state = 1;
}
// In state 2, no special action on touchstart
},
onTouchMove(x, y) {
if (this.state === 1) {
// Update straight-line preview during first session.
if (this.previewCompound) {
Matter.World.remove(window.BallFall.world, this.previewCompound);
this.previewCompound = null;
}
const dx = x - this.startPoint.x,
dy = y - this.startPoint.y,
midX = (this.startPoint.x + x) / 2,
midY = (this.startPoint.y + y) / 2,
angle = Math.atan2(dy, dx),
length = Math.sqrt(dx _ dx + dy _ dy);
this.previewCompound = Matter.Bodies.rectangle(
midX,
midY,
length,
App.config.lineThickness _ 1.05,
{
isStatic: true,
angle: angle,
render: {
fillStyle: "rgba(149,110,255,0.5)",
strokeStyle: "rgba(149,110,255,0.5)",
lineWidth: 1,
},
}
);
Matter.World.add(window.BallFall.world, this.previewCompound);
} else if (this.state === 2) {
// During second session, update the curve preview using current pointer as control.
if (this.previewCompound) {
Matter.World.remove(window.BallFall.world, this.previewCompound);
this.previewCompound = null;
}
this.previewCompound = generateCurveCompoundBody(
this.startPoint,
{ x, y },
this.endPoint,
App.config.curvedLineFidelity,
App.config.lineThickness _ 1.05,
{
fillStyle: "rgba(149,110,255,0.5)",
strokeStyle: "rgba(149,110,255,0.5)",
lineWidth: 1,
}
);
Matter.World.add(window.BallFall.world, this.previewCompound);
}
},
onTouchEnd(x, y) {
if (this.state === 1) {
// First session: finalize end point and create default curve preview.
this.endPoint = { x, y };
if (this.previewCompound) {
Matter.World.remove(window.BallFall.world, this.previewCompound);
this.previewCompound = null;
}
const defaultControl = {
x: (this.startPoint.x + this.endPoint.x) / 2,
y: (this.startPoint.y + this.endPoint.y) / 2,
};
this.previewCompound = generateCurveCompoundBody(
this.startPoint,
defaultControl,
this.endPoint,
App.config.curvedLineFidelity,
App.config.lineThickness \* 1.05,
{
fillStyle: "rgba(149,110,255,0.5)",
strokeStyle: "rgba(149,110,255,0.5)",
lineWidth: 1,
}
);
Matter.World.add(window.BallFall.world, this.previewCompound);
this.state = 2;
} else if (this.state === 2) {
// Second session: use current pointer as control to finalize the curve.
this.finish(x, y);
new BaseDrawingTool("curved", App.config.costs.curved).charge();
}
},
};

// --- Helper functions ---

// Compute a point on a quadratic Bezier for a given t.
function quadraticBezier(points, t) {
const [p0, p1, p2] = points;
return {
x: (1 - t) _ (1 - t) _ p0.x + 2 _ (1 - t) _ t _ p1.x + t _ t _ p2.x,
y: (1 - t) _ (1 - t) _ p0.y + 2 _ (1 - t) _ t _ p1.y + t _ t _ p2.y,
};
}

// Generate a compound body approximating a curved stroke by splitting the Bezier curve into segments.
// Each segment is rendered as a small rectangle, and the compound body is the union of these parts.
function generateCurveCompoundBody(
p0,
control,
p2,
numSegments,
thickness,
renderOptions
) {
const parts = [];
let prevPt = quadraticBezier([p0, control, p2], 0);
for (let i = 1; i <= numSegments; i++) {
const t = i / numSegments;
const pt = quadraticBezier([p0, control, p2], t);
const mid = { x: (prevPt.x + pt.x) / 2, y: (prevPt.y + pt.y) / 2 };
const dx = pt.x - prevPt.x;
const dy = pt.y - prevPt.y;
const length = Math.sqrt(dx _ dx + dy _ dy);
const angle = Math.atan2(dy, dx);
const segment = Matter.Bodies.rectangle(mid.x, mid.y, length, thickness, {
isStatic: true,
angle: angle,
render: renderOptions,
});
parts.push(segment);
prevPt = pt;
}
return Matter.Body.create({
parts: parts,
isStatic: true,
render: renderOptions,
});
}

----- static\js\dotted-line.js -----
/\*

- dotted‐line.js
- Implements a dotted line tool.
- Dotted lines use color "#a8328d" and begin with health from App.config.dottedLineHealth (default 5).
- Each collision with a ball decrements health and updates the dash pattern.
- When health reaches 0 the line is removed.
  \*/
  (function () {
  // Dash patterns keyed by current health.
  const DASH_PATTERNS = {
  5: [], // full health: drawn as a solid line
  4: [20, 10],
  3: [15, 10],
  2: [10, 10],
  1: [5, 10],
  };

// Update our custom dash pattern property based on health.
const updateDashPattern = (body) => {
body.customDash = DASH_PATTERNS[body.health] || [];
};

const DottedLineTool = {
state: 0,
firstPoint: null,
previewLine: null,
onClick(x, y) {
if (this.state === 0) {
this.firstPoint = { x, y };
this.state = 1;
} else {
this.finish(x, y);
}
},
onMove(x, y) {
if (this.state !== 1) return;
this.updatePreview(x, y);
},
updatePreview(x, y) {
if (!window.BallFall || !window.BallFall.world) return;
if (this.previewLine) {
Matter.World.remove(window.BallFall.world, this.previewLine);
this.previewLine = null;
}
const dx = x - this.firstPoint.x,
dy = y - this.firstPoint.y,
length = Math.sqrt(dx _ dx + dy _ dy),
angle = Math.atan2(dy, dx),
midX = (this.firstPoint.x + x) / 2,
midY = (this.firstPoint.y + y) / 2;
// For preview, draw a thin outline in the dotted color.
this.previewLine = Matter.Bodies.rectangle(
midX,
midY,
length,
App.config.lineThickness,
{
isStatic: true,
angle: angle,
render: {
visible: true,
fillStyle: "transparent",
strokeStyle: "#a8328d",
lineWidth: 2, // thinner preview
lineDash: [],
},
}
);
Matter.World.add(window.BallFall.world, this.previewLine);
},
finish(x, y) {
if (this.previewLine) {
Matter.World.remove(window.BallFall.world, this.previewLine);
this.previewLine = null;
}
const dx = x - this.firstPoint.x,
dy = y - this.firstPoint.y,
length = Math.sqrt(dx _ dx + dy _ dy),
angle = Math.atan2(dy, dx),
midX = (this.firstPoint.x + x) / 2,
midY = (this.firstPoint.y + y) / 2;
// Create the dotted line body. Disable Matter's default drawing.
const dottedLine = Matter.Bodies.rectangle(
midX,
midY,
length,
App.config.lineThickness,
{
isStatic: true,
angle: angle,
label: "DottedLine",
render: {
visible: false, // custom rendering only
fillStyle: "transparent",
strokeStyle: "#a8328d",
lineWidth: App.config.lineThickness,
},
}
);
dottedLine.health = App.config.dottedLineHealth || 5;
updateDashPattern(dottedLine);
Matter.World.add(window.BallFall.world, dottedLine);
if (
window.App.modules.lines &&
typeof window.App.modules.lines.addLine === "function"
) {
window.App.modules.lines.addLine(dottedLine);
}
this.state = 0;
this.firstPoint = null;
},
cancel() {
if (this.previewLine) {
Matter.World.remove(window.BallFall.world, this.previewLine);
this.previewLine = null;
}
this.state = 0;
this.firstPoint = null;
},
onTouchStart(x, y) {
this.onClick(x, y);
},
onTouchMove(x, y) {
this.onMove(x, y);
},
onTouchEnd(x, y) {
this.finish(x, y);
},
};

// Collision handler: decrement health and update dash pattern.
function registerDottedLineCollision() {
Matter.Events.on(window.BallFall.engine, "collisionStart", (event) => {
event.pairs.forEach((pair) => {
let dottedLine = null;
if (
pair.bodyA.label === "DottedLine" &&
pair.bodyB.label === "BallFallBall"
) {
dottedLine = pair.bodyA;
} else if (
pair.bodyB.label === "DottedLine" &&
pair.bodyA.label === "BallFallBall"
) {
dottedLine = pair.bodyB;
}
if (dottedLine) {
dottedLine.health--;
if (dottedLine.health > 0) {
updateDashPattern(dottedLine);
} else {
Matter.World.remove(window.BallFall.world, dottedLine);
}
}
});
});
}

// Custom rendering: redraw dotted lines as a complete outline with our dash pattern and a thin stroke.
function registerDottedLineRender() {
const render = window.BallFall.render;
if (!render) return;
Matter.Events.on(render, "afterRender", function () {
const context = render.context;
// Apply the view transform so we draw in world (page) space
Matter.Render.startViewTransform(render);
const bodies = Matter.Composite.allBodies(window.BallFall.world);
bodies.forEach(function (body) {
if (body.label === "DottedLine") {
context.save();
const opacity =
body.render.opacity !== undefined ? body.render.opacity : 1;
context.globalAlpha = opacity;
context.strokeStyle = "#a8328d";
context.lineWidth = 2;
context.setLineDash(body.customDash || []);
context.beginPath();
const vertices = body.vertices;
context.moveTo(vertices[0].x, vertices[0].y);
for (let i = 1; i < vertices.length; i++) {
context.lineTo(vertices[i].x, vertices[i].y);
}
context.closePath();
context.stroke();
context.restore();
}
});
Matter.Render.endViewTransform(render);
});
}

if (window.BallFall && window.BallFall.engine) {
registerDottedLineCollision();
registerDottedLineRender();
} else {
window.addEventListener("BallFallBaseReady", function () {
registerDottedLineCollision();
registerDottedLineRender();
});
}

window.DottedLineTool = DottedLineTool;
})();

----- static\js\launcher-create.js -----
/_ static/js/launcher-create.js _/
window.LauncherCreateTool = {
state: 0, // 0: waiting for start, 1: waiting for direction
startPoint: null,
launcherPreview: null,
previewLine: null,
arrowPreview: null,
// Currently selected launcher type (defaults to "launcher")
selectedType: "launcher",

onClick(x, y) {
if (this.state === 0) {
const tool = new BaseDrawingTool("launcher", App.config.costs.launcher);
if (!tool.canPlace()) {
BaseDrawingTool.showInsufficientFunds();
return;
}
this.startPoint = { x, y };
// Create launcherPreview as before…
const size = 40;
const scale = size / 250;
this.launcherPreview = Matter.Bodies.rectangle(x, y, size, size, {
isStatic: true,
isSensor: true,
label: "Launcher",
render: {
sprite: {
texture: App.config.launcherTypes[this.selectedType].image,
xScale: scale,
yScale: scale,
},
opacity: 0.6,
},
});
this.launcherPreview.isPreview = true;
Matter.World.add(window.BallFall.world, this.launcherPreview);
this.state = 1;
} else if (this.state === 1) {
this.finish(x, y);
const cost = App.config.costs[this.selectedType];
new BaseDrawingTool(this.selectedType, cost).charge();
}
},

onMove(x, y) {
if (this.state !== 1) return;
if (this.previewLine) {
Matter.World.remove(window.BallFall.world, this.previewLine);
this.previewLine = null;
}
if (this.arrowPreview) {
Matter.World.remove(window.BallFall.world, this.arrowPreview);
this.arrowPreview = null;
}
const dx = x - this.startPoint.x,
dy = y - this.startPoint.y,
distance = Math.sqrt(dx _ dx + dy _ dy),
angle = Math.atan2(dy, dx);
// Clamp distance to maxSpeed from config
const maxSpeed = App.config.launcherTypes[this.selectedType].maxSpeed;
const clampedDistance = Math.min(distance, maxSpeed);
const clampedX = this.startPoint.x + Math.cos(angle) _ clampedDistance;
const clampedY = this.startPoint.y + Math.sin(angle) _ clampedDistance;

    Matter.Body.setAngle(this.launcherPreview, angle);

    const midX = (this.startPoint.x + clampedX) / 2,
      midY = (this.startPoint.y + clampedY) / 2;
    this.previewLine = Matter.Bodies.rectangle(
      midX,
      midY,
      clampedDistance,
      App.config.lineThickness,
      {
        isStatic: true,
        angle: angle,
        render: {
          fillStyle: "rgba(149,110,255,0.5)",
          strokeStyle: "rgba(149,110,255,0.5)",
          lineWidth: 1,
        },
      }
    );
    Matter.World.add(window.BallFall.world, this.previewLine);

    const arrowSize = 20;
    this.arrowPreview = Matter.Bodies.rectangle(
      clampedX,
      clampedY,
      arrowSize,
      arrowSize,
      {
        isStatic: true,
        angle: angle,
        render: {
          sprite: { texture: "images/arrow.png" },
          opacity: 0.6,
        },
      }
    );
    Matter.World.add(window.BallFall.world, this.arrowPreview);

},

finish(x, y) {
if (this.previewLine) {
Matter.World.remove(window.BallFall.world, this.previewLine);
this.previewLine = null;
}
// Remove the arrow preview to prevent it from sticking around.
if (this.arrowPreview) {
Matter.World.remove(window.BallFall.world, this.arrowPreview);
this.arrowPreview = null;
}
const dx = x - this.startPoint.x,
dy = y - this.startPoint.y,
distance = Math.sqrt(dx _ dx + dy _ dy),
angle = Math.atan2(dy, dx);
// Clamp distance based on maxSpeed.
const maxSpeed = App.config.launcherTypes[this.selectedType].maxSpeed;
const clampedDistance = Math.min(distance, maxSpeed);
Matter.Body.setAngle(this.launcherPreview, angle);
const forceScale = 0.05;
this.launcherPreview.launchForce = {
x: Math.cos(angle) _ clampedDistance _ forceScale,
y: Math.sin(angle) _ clampedDistance _ forceScale,
};
this.launcherPreview.delay =
App.config.launcherTypes[this.selectedType].delay;
this.launcherPreview.maxSpeed = maxSpeed;
this.launcherPreview.isPreview = false;
if (App.modules.lines && typeof App.modules.lines.addLine === "function") {
App.modules.lines.addLine(this.launcherPreview);
}
// Save launcher persistence data and capture the persistent id.
let persistentId = App.Persistence.saveLauncher({
type: "launcher",
selectedType: this.selectedType,
startPoint: this.startPoint,
endPoint: { x: x, y: y },
});
this.launcherPreview.persistenceId = persistentId;
this.launcherPreview = null;
this.state = 0;
this.startPoint = null;
},

cancel() {
if (this.previewLine) {
Matter.World.remove(window.BallFall.world, this.previewLine);
this.previewLine = null;
}
if (this.arrowPreview) {
Matter.World.remove(window.BallFall.world, this.arrowPreview);
this.arrowPreview = null;
}
if (this.launcherPreview) {
Matter.World.remove(window.BallFall.world, this.launcherPreview);
this.launcherPreview = null;
}
this.state = 0;
this.startPoint = null;
},

onTouchStart(x, y) {
const tool = new BaseDrawingTool("launcher", App.config.costs.launcher);
if (!tool.canPlace()) {
BaseDrawingTool.showInsufficientFunds();
return;
}
this.onClick(x, y);
},
onTouchMove(x, y) {
this.onMove(x, y);
},
onTouchEnd(x, y) {
if (this.state === 1) {
this.finish(x, y);
const cost = App.config.costs[this.selectedType];
new BaseDrawingTool(this.selectedType, cost).charge();
}
},
};

----- static\js\persistent.js -----
/_ persistent.js - Handles per-page persistence for goal, line, and launcher objects.
Coins persistence remains unchanged.
_/
(function () {
// Generate a key that is unique per page.
function pageKey(itemName) {
let pageId = window.location.pathname.replace(/\//g, "\_") || "home";
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
// Generate a unique id for the line if not provided.
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
// Generate a unique id for the launcher if not provided.
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
// --- New auto-clicker persistence functions ---
saveAutoClicker: function (autoData) {
App.Storage.setItem(pageKey("autoclicker"), autoData);
},
loadAutoClicker: function () {
// Default: not purchased, no upgrades.
return App.Storage.getItem(pageKey("autoclicker"), {
purchased: false,
maxSpeedLevel: 0,
});
},
rebuildGoal: function () {
const gd = this.loadGoal();
if (!gd) return;
const body = Matter.Bodies.circle(gd.x, gd.y, gd.goalWidth / 2, {
isStatic: true,
isSensor: true,
label: "Goal",
render: {
sprite: {
texture: goalTexture,
xScale: gd.goalWidth / 100,
yScale: gd.goalHeight / 100,
},
visible: true,
},
});
Matter.World.add(window.BallFall.world, body);
if (App.modules.goal && typeof App.modules.goal.attach === "function") {
App.modules.goal.attach(body);
}
},
rebuildLines: function () {
const lines = this.loadLines();
if (!lines || !lines.length) return;
lines.forEach(function (ld) {
let body;
if (ld.type === "straight") {
const dx = ld.p2.x - ld.p1.x,
dy = ld.p2.y - ld.p1.y,
length = Math.sqrt(dx _ dx + dy _ dy),
angle = Math.atan2(dy, dx),
midX = (ld.p1.x + ld.p2.x) / 2,
midY = (ld.p1.y + ld.p2.y) / 2;
body = Matter.Bodies.rectangle(
midX,
midY,
length,
App.config.lineThickness,
{
isStatic: true,
angle: angle,
render: {
fillStyle: "#956eff",
strokeStyle: "#956eff",
lineWidth: 1,
},
}
);
} else if (ld.type === "curved") {
body = generateCurveCompoundBody(
ld.startPoint,
ld.controlPoint,
ld.endPoint,
ld.fidelity || App.config.curvedLineFidelity,
App.config.lineThickness,
{
fillStyle: "#956eff",
strokeStyle: "#956eff",
lineWidth: 1,
}
);
}
if (body) {
// Attach the persistent id so that deletions can be synced.
body.persistenceId = ld.id;
Matter.World.add(window.BallFall.world, body);
if (
App.modules.lines &&
typeof App.modules.lines.addLine === "function"
) {
App.modules.lines.addLine(body);
}
}
});
},
rebuildLaunchers: function () {
const launchers = this.loadLaunchers();
if (!launchers || !launchers.length) return;
launchers.forEach(function (ld) {
const size = 40,
scale = size / 250;
const body = Matter.Bodies.rectangle(
ld.startPoint.x,
ld.startPoint.y,
size,
size,
{
isStatic: true,
isSensor: true,
label: "Launcher",
render: {
sprite: {
texture: App.config.launcherTypes[ld.selectedType].image,
xScale: scale,
yScale: scale,
},
opacity: 1,
},
}
);
const dx = ld.endPoint.x - ld.startPoint.x,
dy = ld.endPoint.y - ld.startPoint.y,
angle = Math.atan2(dy, dx),
distance = Math.min(
Math.sqrt(dx _ dx + dy _ dy),
App.config.launcherTypes[ld.selectedType].maxSpeed
),
forceScale = 0.05;
Matter.Body.setAngle(body, angle);
body.launchForce = {
x: Math.cos(angle) _ distance _ forceScale,
y: Math.sin(angle) _ distance _ forceScale,
};
body.delay = App.config.launcherTypes[ld.selectedType].delay;
body.maxSpeed = App.config.launcherTypes[ld.selectedType].maxSpeed;
body.isPreview = false;
// Attach the persistent id.
body.persistenceId = ld.id;
Matter.World.add(window.BallFall.world, body);
if (
App.modules.lines &&
typeof App.modules.lines.addLine === "function"
) {
App.modules.lines.addLine(body);
}
});
},
};

window.addEventListener("BallFallBaseReady", function () {
App.Persistence.rebuildGoal();
App.Persistence.rebuildLines();
App.Persistence.rebuildLaunchers();
});
})();

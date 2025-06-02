/* static/js/bubblewand-config.js
 * Simple helper to centralise Bubble-Wand geometry.
 */
window.BubbleWandConfig = (function () {
  function getParams() {
    const nat = { w: 500, h: 500 }; // bubblewand.png native pixels
    const tgt = App.config.ballSize * App.config.bubbleWand.diameterMultiplier;
    const scale = tgt / nat.w;
    const radius =
      App.config.ballSize * App.config.bubbleWand.sensorRadiusMultiplier;
    return { scale, radius, natW: nat.w, natH: nat.h };
  }
  return { getParams };
})();

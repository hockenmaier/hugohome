/* static/js/compactor-config.js */
/*
 * Compactor configuration helper.
 * Computes scale factor and open X offsets based on App.config.compactor settings.
 */
window.CompactorConfig = (function () {
  function getParams() {
    const natural = App.config.compactor.naturalDimensions;
    const leftW = natural.left.width;
    const midW = natural.middle.width;
    const rightW = natural.right.width;
    const totalNatW = leftW + midW + rightW;
    const targetTotalW =
      App.config.ballSize * App.config.compactor.targetWidthMultiplier;
    const scaleFactor = targetTotalW / totalNatW;
    // Open positions: centers for left/right parts.
    const leftOpenX = -(totalNatW / 2 - leftW / 2) * scaleFactor;
    const rightOpenX = (totalNatW / 2 - rightW / 2) * scaleFactor;
    return { scaleFactor, leftOpenX, rightOpenX, totalNatW };
  }
  return { getParams: getParams };
})();

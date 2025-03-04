/* line-tool-base.js
 * Provides common functionality for line drawing tools.
 */
var BaseLineTool = {
  addPreview: function (body) {
    this.previews.push(body);
    Matter.World.add(window.BallFall.world, body);
  },
  clearPreviews: function () {
    this.previews.forEach(function (body) {
      Matter.World.remove(window.BallFall.world, body);
    });
    this.previews = [];
  },
};

function mixinBaseLineTool(target) {
  target.previews = [];
  target.addPreview = BaseLineTool.addPreview;
  target.clearPreviews = BaseLineTool.clearPreviews;
}

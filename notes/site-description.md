I'm Brian Hockenmaier and this repository is for my personal website, the hockenworks, which contains many posts about historical projects and experiments I've built as well as some essay-style writing.

This site is a hugo cms running the Paige theme, which you can find lots of documentation for here:
https://willfaught.com/paige/

Paige is a unique theme and you should make sure to double check whether functionality is default hugo or default paige, or something I have changed in layouts/partials.

On top of the site runs a physics simulation game I call "The Ball Machine." Its files live mostly in static/js, as well as ball-machine-ui.html under layouts/partials. Pay attention to how they are loaded and enabled in baseof.html.
Ball Machine is only fully loaded when the user clicks the spawner on any page, but can also do some things like keep track of an uptick of coins earned in the background when the game is not loaded. It is the reason for some of how assets are referenced around the site.

This site is deployed via github pages, which contains the content from the /public folder, which I deploy by pushing changes to a special gh-pages branch which is picked up through GH actions. It is served on hockenworks.com via Cloudflare.

All images live under `assets/images` so that Hugo's resource pipeline can process them. A render hook converts each image to WebP at build time and outputs a `<picture>` block with a WebP `<source>` and the original file as a fallback. The hook calls Paige's built-in image partial so images keep their intrinsic width and height.

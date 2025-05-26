---
title: "Test Embeds"
date: 2020-05-20
categories: ["builds"]
stack: ["Openscad", "Bambulab"]
draft: true
project_link: ""
github_link: ""
short_description: "A 4 player board game where you gamble to take over a fruit tree."
tags: ["Multiplayer", "Game Development", "Board Games", 3D Modeling]
---

[paige.alert]
message: "Get more information <a href=\"#\" class=\"alert-link\">here</a>."
type: "primary"
Quote
{{< paige/quote cite="Hickory Dickory Dock" >}}
Hickory dickory dock.<br>
The mouse ran up the clock.<br>
The clock struck one,<br>
The mouse ran down,<br>
Hickory dickory dock.
{{< /paige/quote >}}

<!--more-->

{{< paige/quote >}}

1. _"Work should be a sacrifice, and more money means more security for my family."_
   {{< /paige/quote >}}

X^n^ + Y^n^ = Z^n^

<abbr title="This allows to hover for more info">Abbreviations</abbr>

H<sub>2</sub>O

~Strikethrough~

Press <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Delete</kbd> to end the session.

==This is a highlight==

```
// ---- Removed Existing Collision Border Effect ----

    const ballPositionData = {};
    function removeBallsBelowPage() {
      const bodies = Composite.allBodies(engine.world);
      const pageBottom = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      bodies.forEach((body) => {
        if (body.label === "BallFallBall" && body.position.y > pageBottom) {
          World.remove(engine.world, body);
          delete ballPositionData[body.id];
        }
      });
    }

```

Here's a Download:
{{< download file="https://www.dropbox.com/scl/fo/4piy97k725ee1xp3cn4pe/AEUfIYTEgcOtlUmsc0qeT1s?rlkey=ygd4jhs57c35xq3ska7vs6xjy&dl=0" >}}
7/24/24 Build Download
{{< /download >}}

Here's a Gist:
{{< gist hockenmaier afb228dc7776cded521127b9edec2c94 >}}

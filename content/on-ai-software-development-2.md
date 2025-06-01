---
title: "On AI Software Development, 2025 Edition"
date: 2025-07-07
categories: ["writing"]
personal: "Y"
tags: ["software", "singularity", "AI", "software", "predictions"]
---

Recently I read the [AI 2027 paper](https://ai-2027.com/scenario.pdf). I was surprised to see Scott Alexander's name on this paper and I was doubly surprised to see him do his [first face reveal podcast about it with Dwarkesh](https://www.dwarkesh.com/p/scott-daniel)

On its face this is one of the most aggressive predictions for when we will have AGI (at least the new definition of AGI which is something that is comparable or better than humans at all non-bodily tasks) that I have read. Even as someone who has been a long believer in [Ray Kurzweil's Singularity predictions](https://en.wikipedia.org/wiki/The_Singularity_Is_Near), 2027 strikes me as very early. I realize that Kurzweil's AGI date was also late 2020's and 2045 was his singulartiy prediction - 2027 still feels early to me.

{{< round-gallery >}}
images/ai-2027.png|AI 2027,
images/The-Singularity-Is-Near.jpg|Singularity Is Near
{{< /round-gallery >}}

I won't get into my full take on AI 2027 here, but the core argument comes down to the same one I was making in my [original post on AI software development](/on-ai-software-development)

- which is that, once AI agents are able to replace software engineers, instead of just assisting them, it doesn't matter how they are doing in other realms, because they will simply be able to improve on themselves and their own software at such a rate that the difference between the time of automating software engineering jobs and the time of automating all other jobs is negligible.

So I figured it was a good time to update on where I think AI is actually at at software engineering tasks. I've had the chance to test many of the latest AI software development tools and models, and we have come a long way since my original post.

I have been doing a lot of development with AI for the last few years, especially the last couple of months on parental leave building the game in this site. And they are good! But the core problems with these models for software engineering are:

1.  They can't deal well with contexts over 30K tokens or so (even the best models with supposed millions of token windows).

This means the actual developer (me and you) are the ones picking specific files and functions to send into the context window, lest we confuse the model. This is arduous unless the codebase is small enough to fit entirely into the context window. That's exactly what I think is going on with most of the new "vibe coded" projects we see showing impressive results - these are just tiny POC apps that haven't hit more than a few thousand lines of code yet. For context, most serious enterprise apps containing the detailed logic and edge cases real use cases require are in the millions or hundreds of millions of lines of code.

2.  They are biased to be "advisors" as well as "doers"

This is just annoying, and I hope it gets trained out soon. Models just really _want_ you to be doing everything, and to act themselves as an advisor. It makes sense with one of the main sources of code training data being from Stackoverflow and other blogs, where developers can never seem to rid themselves of a pseudo-condescending "you should have been able to read the docs and learn this yourself" tone. It's also just a pattern exhibited by people in general - more often than not, especially in the corporate world, people are trained to be the "coaches" rather than the "worker bees". One reason why things get done so slowly in big political companies sometimes.

---Notes---

Add links to my chat with 03 about the refund feature,

Add links to videos about co-pilot agents as well as codex as the state of the art actual software developers

Talk a little bit about my experience using cursor and what a disappointment it was for a code base as unique as mine

# cursor

Add notes about cursor not handling context any more easily than context caddy - and that might be a bit of a stumbling block

First feature that sonnet 3.7 consistently failed at was simply having the compactors add ball value accumulation of compacted balls

Your request has been blocked as our system has detected suspicious activity from your account.If you believe this is a mistake, please contact us at hi@cursor.com.(Request ID: 997e94bb-34ee-44c0-b0aa-15bb6822add6) LOL

o3's performance on net new "gear" feature for the hockenworks ball machine:

Gear Prompt: https://chatgpt.com/c/683755d0-fbec-8006-9c8b-c77bbe951211
Clean code point for recreation with other models - master just before "gear" branch was created

Today, you will be making a new drawable object for our physics web game. The gear will be a physical object that balls collide with, similar to the compactor, but simpler (No on collision events, just continuous rotation). When balls fall into its grooves, they will be moved around by physics. Gears will rotate at one full revolution every 30 seconds, which should be configurable in the App config.

Placing gears is a bit simpler than other objects, though has the same structure:

Desktop: One click to create a preview that then follows the mouse location, second click finishes and leave the gear centered there. Right click before the finish cancels as normal.

Mobile: Touchstart shows the preview , touchmove has the preview follow the touch location, and touchend finishes. However, there should be no “is Valid distance threshold” of 25 px that the gear must be outside of to place - the gear will always be placed on a touch event.

All normal pulse, delete, and refund effects apply. Both gears cost 750 coins.

The image representing the gear is called gear-30.png (it has 30 teeth), and I have vertices representing its physical shape for the matter body, which I will update an array you leave blank in your new gear.js code like this:

const GEAR_VERTICES = [
[0, 0],
];

The gear should be drawn in 2 types, using 2 toggle buttons: one that turns clockwise and one counterclockwise. You should represent these types and persist them similarly to how the launcher has multiple types.

The toggle button images are gear-clockwise-mode.png and gear-counterclockwise-mode.png

When making new Drawables, you must make all necessary changes around the codebase.

The types of things that you should look for and make sure to change, are:
-UI elements
-UI interactions with other elements
-How to Draw the thing
-How to do second-actions like the curve line bezier
-How to delete
-How hover, hold, and pulse works
-What is in the preview vs the finished drawn item
-Where cost and icons go in the code
-Any new variables in App config
-How data is persisted and deleted from persistence, including any new types to encode somewhere
-All interactions with other files, and make sure to call out that shared files like line-interaction and notifications and powerup-progression
-All desktop AND mobile controls for all actions
-Any new files needed, and their inclusion in baseof.html

As well as anything extra any specific drawable like the gear requires.

Present all code changes as copyable blocks, noting the function they replace or the lines of code they come immediately between.

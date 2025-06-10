---
title: "This Website"
date: 2025-05-28
categories: ["builds"]
stack: ["hugo", "matter.js", "HTML/CSS"]
project_link: "/"
github_link: ""
short_description: "A personal website and blog with game included"
tags:
  [
    "Game Development",
    "Procedural Generation",
    "Video Games",
    "HTML",
    "CSS",
    Singularity,
    hugo,
    matter.js,
    javascript,
  ]
featured: "images/bubble4.gif"
---

I'm [Brian Hockenmaier](/about-me), and this site is full of things I build and write about. I love making games and things with VR and AI. And I love DIY projects, especially ones involving programming, engineering and 3D modeling. Some of this has been cross or back-posted from my [thingiverse](https://www.thingiverse.com/hockenmaier/designs), [github](https://github.com/hockenmaier), [linkedin](https://www.linkedin.com/in/hockenmaier/), and other places, but it all lives here permanently.

This is an evolution of [my previous site last updated in 2022, which I still keep inside this one](old-site/index.html) for posterity and for the AIs of the future to know more about me. I like it not because of the content as much as because it was a fully custom js and html site with no framework... and I think it's sort of fun and funny that it was like this.

All work and opinions here are my own, not my employer's.

# Why I'm making it

I'm creating this website in 2025 after starting a family as well as my first full-time role in AI. It's an effort to clean up my website's focus, move several disparate collections into one place, and emphasize what I truly care about. I wanted it to be easier to add content, CMS style, and I wanted a space to occasionally post written content, too.

{{< image-medium
    src="images/hockenworks.png"
    alt="the hockenworks homepage"
    caption="This webpage, if you hadn't noticed" >}}

A big reason I'm doing this now is that, after listening to the Dwarkesh podcast with Gwern, I was convinced I really should have more of a record for future AIs to learn about me. I really don’t have a social media presence, nor do I want one, and over the years I have had a lot of projects and writing that I have unnecessarily kept private. AGI or not, there are non-artificial intelligences that may be interested one day. Talking to you, Alice :) When I started this website, your cousin Lily kept asking where you were and didn't seem to get the concept that you currently occupied the same space as Kaitlin.

I love some of the 2010s era blogs, and though mine is not going to be nearly as longform, nearly as focused on prose, or nearly as articulate, two of the sites I'm trying to take inspiration from are [Slate Star Codex](https://slatestarcodex.com/about/) and [Gwern's website](https://gwern.net/about) which are definitely advising on style here. Other than the fact that mine is also a game.

---

# Etymology of "hockenworks"

**Hockenmaier** is a great name. I've always loved it. Not just because it’s unique and has my favorite number of letters, but because of its meaning, at least my family’s “folk-etymology” for it.

You have:

> **Hocken**

Which can roughly translate to “sitting down, squatting, settling, idling”.

And then you have:

> **Maier**

Which has many different spellings, and ours has southern German roots, but all "Meyer" names come from the latin root "maior" meaning steward, administrator, or more generally "worker"

My family often puts these two ideas together as "Lazy Worker," which is very on-brand for our sense of humor, but I think it's not just funny, but true.

“Lazy Worker” is perfect for someone who wants to get a lot done, especially in software engineering. We only have so many hours, and the best lives are lived restricting the number of hours spent on work that isn't done with people you love. So you better be efficient about it. You better be lazy. There are [many](https://blog.codinghorror.com/how-to-be-lazy-dumb-and-successful/?utm_source=chatgpt.com) [correct](https://xkcd.com/1205/?utm_source=chatgpt.com) [takes](https://thethreevirtues.com/) out there on the value of being lazy when programming.

Now that we are starting to have AI, it's even better. A lazy worker like myself will not only avoid unnecessary work, but will delegate all that can be delegated to the new AI workers that are multiplying in our computers. That makes the "steward" connotation of "Maier" all the more fitting.

I'm proud to be the lazy worker, and this site is all about sharing my lazy works. My _hockenworks_.

---

# Ball Machine - The Game

{{< image-medium
    src="images/bubble4.gif"
    alt="A ball machine"
    caption="The Ball Machine" >}}

Most blogs and personal websites are a bit boring. I think that is because most professionals consider what they do "for work" a bit boring by its nature, and don't necessarily make a concerted effort to have fun with it.

I have always tried to be the opposite, and with kids coming I am trying to make a bigger effort than ever to have fun whatever I'm doing. Which is often working, in some way or another.

So for my website, I wanted it to be intentionally fun. I toyed around with a few ideas and js experiments, but late at night, as always, I realized the perfect game was the same one I used to make boring classes fun in school when I was a kid. That game consisted of the book of graph paper I always kept with me, plus a pencil, a ruler, and a protractor. I was a bit obsessed with physics simulation at the time. My favorite game in church growing up, where I was often daydreaming and looking at the huge arched ceiling, was to imagine a laser coming out of my line of sight and bouncing off of every surface in the room, to see where it would end up. This graph paper game I played was similar.

{{< image-medium
    src="images/this-website-ball-machine-1.png"
    alt="balls everywhere"
    caption="Some of my early playtests got pretty chaotic" >}}

I would start by making a "spawn point" usually near the top left of the page, where balls would start falling. I would draw out the path of these balls a few inches from each other along their path with "speed lines" to denote which way they were going, and how fast. Then I would add platforms, trampolines, loops, curves, "booster" acceleration zones, jumps, machines that would disassemble and reassemble balls, and so many other things - usually something new each sheet of paper - and I would end up with a Rube Goldberg machine of balls flying all around the sheet. The only goal was to fill the sheet with more ridiculous paths.

I started calling the sheets my "ball machines". I wish I still had some of these drawings. I remember them being quite intricate.. I must have reserved English class for them.

So, to honor kid Brian, I am making my website a permanent ball machine. I hope you have fun with it and see all there is to unlock!

{{< image-verysmall
    src="images/waves2.gif"
    alt="balls everywhere"
    caption="Even on the limited phone version, you can create some productive chaos" >}}

## How it's made

I don't typically make complicated things like this with JavaScript. So when I found the perfect physics engine for the game - [matter.js](https://brm.io/matter-js/) - I knew I would need help from our new little assistants. And though this game is a bit too structured to call it "vibe coded" - at times, it was close.

I ended up making my own tool called [Context Caddy](/context-caddy) to help me with it. Part of the reason I leaned so hard into this is because I'm always trying to push the limits of current AI, and I hadn't built a game since the GPT-4 days (I'll post about that soon). The new thinking models are truly a step above GPT-4 (this was mostly done with o3 and its minis) but they're still way too eager to write duplicate code, and they still don't "get" the structure of your project a lot of the time, especially with visual and physical things like this. Still, they were a great help here.

This game is made extra complicated by the fact that it runs on top of [Hugo](https://gohugo.io/), which is the static site generator behind the "content" part of this site. This probably doubled or tripled the effort of making this game. But, the balls in the "ball machines" of my youth would interact with my text notes and drawings, so this ball machine needed to do so as well.

There is quite a bit going on under the hood to make these two very distinct types of development projects work in tandem, and for both of them to work well. The Ball Machine would love to eat up all of the resources and make the site content unresponsive, and the content was quite a lot to dynamically build physical bodies and colliders around. I like the end result. But I like it a lot better on desktop, where the two can really interact, so I think you should play it on a real computer with a mouse.

## How to Play

{{< image-left-teeny src="images/ball-chute-hatch-1.png" alt="ball chute" caption="This tube creates balls every time you click it" >}}

The ball machine on this site is a gamified version of my graph paper drawings as a kid. Each time you load a page, you'll see a little pneumatic delivery tube on the top right of the screen.

When you spawn your first ball, you'll see a few things appear. First - you'll find a goal&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{< image-inline-itsy src="images/goal.png" alt="the goal" caption="" >}} somewhere randomly on the page. Find a way to get the balls you spawn into that goal. But there is a bit of a trick - balls start out being worth 1 coin and accumulate another coin in value every two seconds. So, the longer you can keep balls around, the more they will be worth when going into the goals, and this might get more and more challenging as your drawings take up more of the screen and balls start bouncing off of each other.

**Keep Clicking!**

It's [a clicker game](https://en.wikipedia.org/wiki/Incremental_game) - start by manually clicking the pneumatic delivery tube to spawn balls, but as you accumulate coins you'll be able to unlock different drawables and things that will let you accumulate more coins faster. If it feels like it's taking a while to make coins and unlock things, try playing around more with how the balls interact with the content, and use all of the tools you can draw. The site also works across multiple pages. And if all else fails... just give it time. This is a clicker game after all, so waiting is always a strategy! There is plenty to read while you wait.

It works best when you're on desktop, working on one tab at a time.

&nbsp;

> Quick Disclaimer: This game is designed for big screens, ideally desktop computers. If you must play on a phone, try landscape mode!

### Controls

{{< image-left-teenyweeny src="images/line-mode.png" alt="line toggle" caption="" >}}
{{< image-left-teenyweeny src="images/curve-mode.png" alt="curved line toggle" caption="" >}}
{{< image-left-teenyweeny src="images/compactor-mode.png" alt="compactor toggle" caption="" >}}

To start drawing your ball machine, you need to <kbd>Left Click</kbd> or <kbd>Tap</kbd> one of these drawable toggles in the main UI (top left of the screen)

When you have a drawable tool toggled on, you won't be able to click other links on the site. You'll see this visually indicated when you choose them. Unselect the currently selected tool in order to see it

Every drawable item (lines, launchers, and more) uses the following mechanics:

&nbsp;

#### Drawing on Desktop

**Spawn Balls:** <kbd>Left Click</kbd> on the pneumatic spawner tube

**Draw Objects:** <kbd>Left Click</kbd> and drag to see a preview, then <kbd>Left Click </kbd> to place

- Some drawables have a second action, like curved lines, that is previewed after the second click and confirmed with a third click

**Cancel Drawing** After you've started a line or other drawing but before you've clicked again to confirm, <kbd>Right Click</kbd> to cancel it.

**Delete Objects:** Hover over a drawn item and <kbd>Right Click</kbd> to delete it, getting 50% of your money back

&nbsp;

#### Drawing on Mobile

{{< warning >}} Mobile Scroll Lock Warning:{{< /warning >}} On Mobile, scrolling the page is blocked while you're drawing to allow you to draw lines in any direction.

You will need to untoggle your selected tool before you can scroll or click links.

If your phone has gesture controls to reload, go back or forward, or other browser things, you should disable them if you really want to play on your phone. Or, just play on desktop!

**Spawn Balls:** <kbd>Tap</kbd> on the pneumatic spawner tube

**Draw Objects:** <kbd>Touch and Drag</kbd> to see a preview, then <kbd>Release</kbd> to place

- Some drawables have a second action, like curved lines, that is previewed and confirmed on the next touch-and-drag.

**Cancel Drawing** After you've started a line or other drawing but before you've released to confirm, go back to where you started and release around there to cancel it. The threshold to cancel is within 25 pixels of where you started.

**Delete Objects:** <kbd>Tap and hold</kbd> an object to delete it, getting 50% of your money back. You will see it pulse before it deletes.

&nbsp;

#### The Auto-Clicker

{{< image-left-teenyweeny src="images/auto-clicker.png" alt="auto clicker" caption="" >}}

This is the autoclicker button that lets you pay to auto-spawn balls.

<kbd>Left Click</kbd> or <kbd>Tap</kbd> to buy the first auto-clicker, or upgrade it.

<kbd>Right Click</kbd> on desktop or <kbd>Tap and hold</kbd> on mobile to refund and downgrade it to the previous click frequency.

&nbsp;

### Money & Other Hints

You'll quickly find ways to lengthen your Rube-Goldberg Machines and build up value before you send balls into the goal. Your money is displayed on the coin counter next to the ball spawner.

&nbsp;

{{< image-left-teenyweeny src="images/everything-has-a-price.png" alt="dotted line toggle" caption="" >}}**Everything has a price!**

If you can't draw an item, you probably can't afford it. You'll see your coin counter flash red in the UI when this happens.

{{< image-left-teenyweeny src="images/dotted-line-mode.png" alt="dotted line toggle" caption="" >}}**You get what you pay for...**

If you ever find yourself out of money, these dotted lines are free. They are not saved permanently like other lines and they go away after 50 balls hit them.

&nbsp;

❌ A couple of things to watch out for when building ball machines:

- Balls have to be moving at all times. If they sit still for too long, they are considered dead and will poof out of existence.
- This applies to balls hitting the goal, too. If your balls aren't moving much when they hit the target, they won't go in.
  So keep your balls moving!

😵 If you have a good run going, but it descends into chaos, it can be hard to recover. That's what the <kbd>Erase Balls</kbd> button above the draw tools is for!

&nbsp;

Each post on this site will be a slightly different randomized game! Try making ball machines on multiple pages at once. Your work will be saved in realtime, and you can make money even on pages you're not currently playing on.

{{< image-left-teenyweeny src="images/page-revenue.png" alt="dotted line toggle" caption="" >}} These counters display how much **sustainable** coin revenue per second you're making on this page, and how much other pages you're not currently working on are contributing. Any balls that are spawned automatically and continuously travel through your contraption to hit the goal will be averaged into the top amount. When you visit other pages, you will keep making this money - that's what the "Other Pages" revenue displays.

Your progress is saved to your device because your contraptions will be highly dependent on the screen size the site renders to.

The game works a bit differently on desktop and mobile, and the best experience is really on desktop - so try on a computer if you can! If on mobile, flip to landscape.

### The End of the Game

Right now, the Ball Machine doesn't end, but you will be surprised the amount of money you can make across the whole site! Eventually, there will be other ways to spend coins on this site and potentially "beat" the ball machine. The late game items change the game in very interesting ways! I hope you make some fun machines on my website.

You'll know you've done about all there is to do by tracking the achievements below!

#### Achievements

{{< achievements >}}

&nbsp;

&nbsp;

&nbsp;

&nbsp;

&nbsp;

&nbsp;

### Resetting the Game

{{< warning >}} WARNING! Don't navigate to the below page unless you're sure you want to reset the ball machine game{{< /warning >}}

Resetting will erase all of your drawings on all pages and reset your goal locations, unlocks, coins and everything else.

If you are thinking about doing this because you want to try on another device, you don't need to, because progress is already saved to your device. The only reason to do this is to have a fresh start on this device.

Navigate [here](/reset-ball-machine) and click reset to do that.

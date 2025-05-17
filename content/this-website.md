---
title: "This Website"
date: 2025-03-01
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
  ]
---

I'm creating this website in 2025 after starting a family as well as my first full-time role in AI. It's an effort to clean up my website's focus and emphasize different things. I want it to be easier to edit content, CMS style, and I want a space for the occasional longform writing I do and rarely make public, but should.

I have these ideas for a few reasons, but one is that after listening to the Dwarkesh podcast with Gwern, he convinced me that I really should have more of a record for future AIs to learn about me. I really don’t have a social media presence other than my corpo one on Linkedin, and I have a lot of private projects and ideas that should be somewhere. If no AGI comes along, there are non-artificial intelligences that may be interested. Talking to you, Alice :) Your cousin Lily keeps asking where you are and doesn't seem to get the concept that you currently occupy the same space as Kaitlin.

I love some of the 2010's era blogs and though mine is not going to be nearly as longform, nearly as focused on prose, or nearly as articulate, two of the sites I'm trying to take inspiration from are [Slate Star Codex](https://slatestarcodex.com/about/) and [Gwern's website](https://gwern.net/about) which are definitely advising on style here.

---

## Etymology of hockenworks

Brian Hockenmaier <bhockenmaier@gmail.com>
1:58 PM (22 minutes ago)
to me

Etymology of "hockenworks"

Hockenmaier is a great name. I've always loved it. Not just because it’s unique and has my favorite number of letters, but because of its meaning, at least my family’s “folk-etymology” for it.

You have:

> Hocken

Which can roughly translate to “sitting down, squating, settling, idling”.

And then you have:

> Maier

Which has many different spellings, and ours has southern German roots, but all "Meyer" names come from the latin root "maior" mean steward, administrator, or more generally "worker"

I've always heard my family put these two components together as "Lazy Worker," which is very on-brand for our sense of humor, but I think it's actually quite appropriate for me.

“Lazy Worker” is perfect for someone who wants to get a lot done, especially in software engineering. We only have so many hours, and the best lives are lived restricting the number of hours spent on work that can't be done with people you love. So you better be efficient about it. You better be lazy. There are [many](https://blog.codinghorror.com/how-to-be-lazy-dumb-and-successful/?utm_source=chatgpt.com) [correct](https://xkcd.com/1205/?utm_source=chatgpt.com) [takes](https://thethreevirtues.com/) out there on the value of being lazy when programming.

Now that we are starting to have AI, it's even better. A lazy worker will not only avoid unnecessary work, but will delegate all that can be delegated to the new AI workers that are multiplying in our computers. That makes the "administrator" connotation of "Maier" all the more fitting.

So I'm proud to be the lazy worker, and this site is all about sharing my lazy works. My _hockenworks_.

---

## Ball Machine - The Game

Most blogs and personal websites are a bit boring. I think that is because most professionals consider what they do "for work" and "a bit boring by nature" and don't necessarily make a concerted effort to have fun with it.

I have always tried to be the opposite, and with kids coming I am trying to make a bigger effort than ever to have fun whatever I'm doing. Which is often working, in some way or another.

So for my website, I wanted it to be intentionally fun. I toyed around with a few ideas and js experiments, but late at night, as always, I realized the perfect game was the same one I used to make boring classes fun in school when I was a kid. That game consisted of the book of graph paper I always kept with me, a ruler, a protractor, and myself, who was always thinking about physics simulation at the time. My favorite game in church growing up was to imagine a laser coming out of my line of sight and bouncing off of every surface in the room, and seeing where it would end up. This graph paper game was similar:

{{< image-medium
    src="images/this-website-ball-machine-1.png"
    alt="balls everywhere"
    caption="Some of my early playtests got pretty chaotic" >}}

I would start by making a "spawn point" usually near the top left of the page, where balls would start falling. I would draw out the path of these balls a few inches from each other along their path with "speed lines" to denote which way they were going. Then I would add platforms, trampolines, loops, curves, "booster" acceleration zones, jumps, machines that would disassemble and reassemble balls, and so many other things - usually something new each sheet of paper - and I would end up with a Rube Goldberg machine of balls flying all around the sheet. The only goal was to fill the sheet with more ridiculous paths.

I started calling the sheets my "ball machines". I wish I still had some of these drawings. I remember them being quite intricate.. I must have reserved English class for them.

So, to honor kid Brian, I am making my website a permanent ball machine. I hope you have fun with it and see all there is to unlock!

## How to Play

> Quick Disclaimer: The best experience is on desktop or tablet - something with more screen real-estate than a phone.

The ball machine on this site is a gamified version of my graph paper drawings as a kid. Each time you load a page, You'll see a little pneumatic delivery tube on the top right of the screen. This tube is where the balls show up when you click.

When you spawn your first ball, you'll see a few things appear. First - you'll find a goal (look for a "target") somewhere randomly on the page. Find a way to get the balls you spawn into that goal. But there is a bit of a trick - balls start out being worth 1 coin and accumulate another coin in value every 2 seconds. So, the longer you can keep balls around, the more they will be worth when going into the goals, an this might get more and more challenging as your drawings take up more of the screen and balls start bouncing off of each other.

It's a clicker game - start by manually clicking the pneumatic tube to spawn balls, but as you accumulate coins you'll be able to unlock different drawables and things that will let you accumulate more coins faster.

### Drawables

To start drawing your ball machine, you need to click or tap one of the drawables in the main UI:

{image}

Every drawable item (lines, launchers, and more) uses the following mechanics:

On Desktop:

- Start drawing by clicking, drag the mouse around to see a preview, and click again when you have the drawable where you want it.
- Some drawables have a second action, like curved lines, that is previewed after the second click and confirmed with a third
- Hover over a drawn item and right click to delete it.

On Mobile:

- Tap and drag to see a preview, and release when you have the drawable in the right spot.
- Second actions for the drawable will start on the next tap-and-drag.
- Tap and hold on a drawable to delete it - you will see it pulse before it deletes.

If you can't draw an item, you probably can't afford it. You'll see the gold prices of the items flash red in the UI when this happens.

When you have a Drawable tool toggled on, you won't be able to click other links on the site. You'll see this visually indicated when you choose them. Unselect the currently selected tool in order to see it

### Tips on Making Money

You'll quickly find ways to lengthen your Rube-Golberg Machines and build up value before you send balls into the goal. A couple of things to watch out for though:

- Balls have to be moving at all times. If they sit still for too long, they are considered dead and will poof out of existence.
- This applies to balls hitting the goal too. If your balls aren't moving when they hit the target, they won't go in.
  So keep your balls moving!

Each post on this site will be a slightly different randomized game! Try making ball machines on multiple pages at once. Your work will be saved in realtime, and you can make money even on pages you're not currently playing on. Try it!

Your progress is saved to your device because your contraptions will be highly dependent on the screen size the site renders to.

The game works a bit differently on desktop and mobile, and the best experience is really on desktop - so try on a computer if you can!

### Resetting the game

{{< warning >}} WARNING! Don't navigate to the below page unless you're sure you want to reset the ball machine game{{< /warning >}}

Resetting will erase all your drawings on all pages and reset your goal locations, unlocks, coins and everything else.

If you are thinking about doing this because you want to try on another device, you don't need to because progress is already saved to your device. The only reason to do this is to have a fresh start on this device.

Navigate [here](/reset-ball-machine) and click reset to do that.

## How it's made

I don't typically make complicated things like this with javascript. So when I found the perfect physics engine for the game - [matter.js](https://brm.io/matter-js/) - I knew I would need help from our new little assistants. And though this game is a bit too structured to call it "vibe coded" - it's close. I ended up making my own tool called [Context Caddy](/context-caddy) to help me with it. Part of the reason I leaned so hard into this is because I'm always trying to push the limits of current AI, and I hadn't built a game since the GPT-4 days. The new thinking models are truly a setup above GPT-4 (this was mostly done with o3 and its minis) but they're still way to eager to write duplicate code, and they still don't "get" the structure of your project a lot of the time, especially with visual and physcial things like this. Still, they were a great help here.

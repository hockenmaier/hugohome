---
title: "8 Player Balloon Fighter"
date: 2025-08-01
url: "/preview/balloon-fight/" # any path you like
_build:
  list: never # don’t show in section/taxonomy/RSS lists
  render: always # still write the HTML file
project_date: 2024-04-01
categories: ["builds"]
short_description: "An 8-player real-time-strategy game with minimalistic art and deep strategic gameplay."
tags:
  [
    "Game Development",
    "Local Multiplayer",
    "Strategy",
    "Unity",
    "C#",
    "Indie Games",
    "Procedural Generation",
    "Video Games",
    "Multiplayer",
    "AI",
    "AI Images",
    "AI Audio",
  ]
---

Today's post is about another video game start that either I or AI will finish one day. I'm building up a bit of a repertoire of those!

This one I started when AI image generation started to become decent. It's a game that I've always wanted to exist, but wasn't feasible for me to create with my current skillsets. I could never pull it off without a lot of commissioning due to the art requirements.

The idea is not as original as some of my games but it's very fun when played in a large group. Essentially, I combine the gameplay of the NES classic balloon fight with eight-player multiplayer. If you've played my game [Land War](/land-war/), you might know that I've been a bit obsessed with eight player multiplayer, or really any game that allows for more than four players to join in.

# Eight-player Video Games

Kaitlin and I love to have people over to socialize, and I love to game. I think they are honestly one of the best ways to have productive, good-natured socialization where people can do things that humans probably evolved to do a lot: band together, form alliances, rib on each other a bit, and sometimes even feel like they've seen something beautiful or had a new experience together. I know that’s a little philosophical and sappy, but I think video games have a huge place in in-person socialization, just like board games do.

I love board games. I play them all the time. But so often when playing board games you run into mechanics that are only there because the game doesn't have a computer involved, can't count for you, can't add things up, can't simulate multiple players' turns at the same time, and though it's nice to not have any screens in front of anybody, I think the limitations of board games hold people back from playing games as a group in general more often than not.

My favorite example of this is Power Grid.

{{< image-tiny
    src="images/power-grid.png"
    alt="The cover art for Power Grid"
    caption="" >}}

Power Grid is a clever game that would be really quite fun if it didn't require players to spend half their time literally doing simple math in their heads or on paper while other people wait. A modern video game with similar dynamics would never do that; it would just let you play the fun part.

Many such cases in board gaming.

But video games have their own limitations and requirements. There are some barriers we aren't getting around anytime before true augmented reality is on everybody's faces, like getting a controller into everybody's hands, and getting them over the fact that they are looking at a screen to socialize. But aside from those, split screen video games have one fundamental limitation most of the time: they only go up to four players. And most social gatherings involve more than four people.

Today, mass-socialization through video games already exists. It's mostly amongst the very young, and mostly over the internet, via metaverses like Roblox. But I'm quite sure that in the future, it will be much more common to play video games (or whatever we call computer-aided social experiences) as a primary form of socialization in-person too.

This belief is the core reason I wanted to make Land War an eight-player strategy game, and this setting of group gatherings was also why the controls for Land War are dead simple.

# Generated Art, First Edition

The reason I waited to make a game like this is because I'm no artist. I like to think I have taste, but it certainly is not in my wheelhouse to make beautiful artwork, even for a simple, sprite-based game I want to make here.

The image models I was mostly working with on this project were Midjourney 6 and Dalle3, both diffusion models. This was essentially the best available at the time. If you've worked with diffusion models before, you know you can get some pretty beautiful and creative stuff, but there are always a few artifacts that will be noticed if someone stares at it long enough, which is always going to be the case for a video game sprite. And, they generally don't do transparency. So I found myself having to do a lot of cleaning and filtering and processing of these images, and I landed on an oil painting filter that worked pretty well to disguise some of the noise and my own edits.

I used these models and techniques for the few backgrounds, tiles, and items in the current game. It was a lot of work just to get a decent looking single sprite, even disregarding animation. Animation is where I ran into the real challenges.

Without complex techniques like [LoRAs](https://arxiv.org/abs/2106.09685), diffusion models just can't iterate on the same image over and over again. Character consistency is not really a thing, and that's what's needed to make a multi-frame sprite that animates. This is the real impasse I ran into, and the core reason I stopped working on this game. I wanted to spend 80% of my time on gameplay, logic, and testing this game, and 20% or less prompting for art and music, but it started to be about 50/50. And the results of those art generations were not amazing.

# The State of Generated Art in 2025

So fast forward to now. We all knew this has been coming for a long time, but finally we have transformer models that do image generation. And part of what that means is that conversation history, including past image generations and reference images, can be included in the neural context of the next generation. We've probably all seen this by now with image ["Ghiblification"](https://www.reuters.com/technology/artificial-intelligence/ghibli-effect-chatgpt-usage-hits-record-after-rollout-viral-feature-2025-04-01/).

OpenAI was yet again the first to release this type of capability, at least in a serious way. Technically, there was a Gemini model that did native image gen maybe a month before OpenAI released theirs, but it was pretty garbage in comparison. And, unexpectedly, the new OpenAI image gen can also generate images on transparent PNG backgrounds, which is absolutely crucial for any image that's going to be set against some dynamic background. Which is the case for most game art.

I have since taken a few attempts at making some multi-frame sprite animations, and it's almost there - almost good enough to one-shot simple game animations. But, unlike what you might be led to believe by excited Xitter posts with whole sprite sheets generated, it's still a lot of work to get what you want for a game. The models just still aren't consistent enough to produce images that don't require a heavy amount of editing to get the same amount of background space, full actual sprite sheet specs, keep characters absolutely consistent, etc. But I think they will get there soon.

# Generated Audio

Generated music was a surprising high point of this project. Great quality sound effect and music generators were on my checklist of things that I knew would come soon, but I got super lucky when [Udio](https://www.udio.com/creators/hockenmaier) came out about a month or two into prototyping this thing. Check out some of these tracks in the link above and the video below.

But as good as AI generated music is getting, sound effects are still not there. You can occasionally get something that sounds like what you intended but in general there's a lot of noise, a lot of strange lead-ins, and in general just strangeness. AI sound effects will be a huge unlock for indie development when they're good enough. I didn't spend much time or any money on sound effects so far, so you won't hear too many in the prototype.

# Current State of the Game

So here's where I'm at, check out this video which is just me playing against seven bots:

{{< youtube G3v7M9V9NGk >}}

The game is fun with multiple players, but it's still quite basic, and I'm still waiting on image generation that would make the graphics good rather than the stand-ins that are mostly still from the diffusion era of image generation.

I did not tune much, nor did I add a lot of the platformer-niceties that are really needed to make a 2D platformer feel right, and it's a bit clunky as a result. But I do think this is a promising enough mechanic to make a great battle game out of one day.

At some point I will pick this thing back up, or I will have some AI agent pick it back up for me, because the core game itself is something I really want to exist, even if it's just another Land War that a few hundred people download and I play at my own get-togethers, or play with my kids.

You can download a Windows build here, which is still very much a prototype, but the core gameplay is there and it works with 8 connected controllers:

{{< download file="https://www.dropbox.com/scl/fo/4piy97k725ee1xp3cn4pe/AEUfIYTEgcOtlUmsc0qeT1s?rlkey=ygd4jhs57c35xq3ska7vs6xjy&dl=0" >}}
7/24/24 Build Download
{{< /download >}}

Thanks for reading! Leave me a comment if you have ideas for the game or AI models I should be on the lookout for!

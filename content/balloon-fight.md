---
title: "8 Player Balloon Fighter"
date: 2025-01-01
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
  ]
---

Today's post is about another half finished game that either I or AI will finish one day. I'm gaining a bit of a repertoire of those. This is one that I started when AI image generation started to become decent. It's a game that I've always wanted to exist but with my current skill sets, I could never pull off without a lot of commissioning due to the art requirements.

The idea is not as original as some of my games but it's very fun when played in a large group. Essentially, I combine the gameplay of the NES classic balloon fight with eight-player multiplayer. If you've played my game Land war, you might know that I'm a bit obsessed with eight player multiplayer, or really specifically anything that's more than four players which is where most video games typically max out.

# Eight-player video games

Kaitlin and I love to have people over to socialize, and I love to game. I think they are honestly one of the best ways to have productive, good natured socialization where people can do things like band together, rib on each other a bit, and sometimes even feel like they've seen something beautiful or had a new experience together. I know that's a little philosophical and sappy, but I think there's a huge place for video games in actual socialization, similar to how board games have a place.

And I love board games. I play them all the time. But so often when playing board games you run into mechanics that are only there because the game doesn't have a computer involved, can't count for you, can't add things up, can't simulate multiple players turns at the same time, and though it's nice to not have any screens in front of anybody, I think the limitations of board games hold people back from playing games as a group in general more often than not.

My favorite example of this is power grid.

{{< image-tiny
    src="images/power-grid.png"
    alt="an image of the cover art for Power Grid"
    caption="" >}}

Power Grid is a clever game that would be really quite fun if it didn't require players to spend half their time literally doing simple math in their heads or on paper while other people waited. A modern video game with similar dynamics would never do that; it would just let you play the fun part. Many such cases in board gaming.

But video games have their own limitations and requirements. Aside from the stuff that we aren't getting around anytime before true augmented reality is on everybody's faces, like getting a controller and everybody's hands, and getting them over the fact that they are looking at a screen to socialize, video games have one fundamental limitation most of the time which is that they only go up to four players. And most social gatherings involve more than four people.

This is the core reason I wanted to make land war an eight-player strategy game, and this setting of group gatherings was also why the controls for land war are so dead simple. More about land war [here](/land-war)

# Generated Art, First Edition

The reason I waited to make a game like this is because I'm no artist. I like to think I have taste but it certainly is not in my wheelhouse to make beautiful artwork, even for a simple sprite based game I want to make here.

The models I was mostly working with on this project were Mid journey 6 and Dalle3, both diffusion models which is the best you could get at the time. If you've worked with diffusion models before, you know you can get some pretty beautiful and creative stuff, but there are always a little artifacts that will be noticed if someone stares at it long enough, which is always going to be a case for a video game sprite. So I found myself having to do a lot of cleaning and filtering and processing of the images, and I landed on an oil painting filter that worked pretty well to disguise some of the noise and my own edits that I would inevitably have to apply to the images of my characters, power-ups, etc.

It was a lot of work just to get a decent looking single sprite, not animated. Animation is where I ran into the real challenges.

Diffusion models without some very complicated hard work in the form of techniques like LORAs (link) just can't iterate on the same image over and over again. Character consistency is not really a thing, and that's what's needed to make a multi-frame sprite that animates. This is the real impasse I ran into, and the core reason that I stopped working on this game. I wanted to spend 80% of my time on the gameplay, logic, and testing of this game, and 20% prompting for art, but it started to be about 50/50. And the results were not amazing.

# The State of Generated Art in 2025

So fast forward to now. We all knew this has been coming for a long time, but finally we have transformer models that do image generation. And part of what that means is that conversation history, including past image generations and reference images, can be included in the neural context of the next generation. We probably all seen this with image ["Ghiblification"](https://www.reuters.com/technology/artificial-intelligence/ghibli-effect-chatgpt-usage-hits-record-after-rollout-viral-feature-2025-04-01/).

OpenAI was yet again the first to release this type of capability, at least in a serious way. Technically there was a Gemini model that did native image gen maybe a month before OpenAI released theirs, but it was pretty garbage in comparison. And, unexpectedly, the new OpenAI image gen can also generate images on transparent PNG backgrounds, which is absolutely crucial for any image that's going to be set against some dynamic background - this is all game art.

I have since taken a few attempts at making some multi-frame spray animations, and it's almost there, but it's still a lot of work unlike what you might be led to believe by excited Twitter posts with whole sprite sheets generated. The models just still aren't consistent enough to produce images that don't require a heavy amount of editing to get the same amount of background space, fallout actual sprite sheet specs, keep characters absolutely consistent. But I think they will get there soon.

# Generated Music

Generated music was a surprising high point of this project. Great quality sound effect and music generators were on my checklist of things that I knew would come soon, but I got super lucky when udio (link) came out about a month and two prototyping this thing. Check out these tracks I put into the game:

(Media)

I will say generated sound effects are still not there, similar to art. You can occasionally get something that sounds like what you intended but in general there's a lot of noise, a lot of strange lead-ins, and in general just strangeness.

# Current State of the Game

So here's where I'm at, check out this video which is just me playing against seven bots but you can start to get the idea:

{youtube embed}

The game is fun with multiple players, but it's still quite basic, and I'm still waiting on image generation that would make the graphics good rather than the stand-ins that are mostly still from the diffusion era of image generation.

At some point I will pick this thing back up, or I will have some AI agent pick it back up for me, because the core game itself is something I really want to exist, even if it's just another land war that a few hundred people download and I play at my own get togethers.

If you'd like, you can download a Windows build here, which is still very much a prototype but works with 8 connected controllers:

{{< download file="https://www.dropbox.com/scl/fo/4piy97k725ee1xp3cn4pe/AEUfIYTEgcOtlUmsc0qeT1s?rlkey=ygd4jhs57c35xq3ska7vs6xjy&dl=0" >}}
7/24/24 Build Download
{{< /download >}}

---
title: "The Flapper - A Physical VR Multiplayer Game"
date: 2025-06-23
project_date: 2023-02-01
categories: ["builds"]
stack: ["Unity", "C#", "Photon Networking", "XR Toolkit"]
project_link: ""
github_link: ""
short_description: "A Co-op Networked VR Experience with Crossplay on Meta Quest and SteamVR"
tags:
  [
    "VR",
    "Multiplayer",
    "Networking",
    "Crossplay",
    "Game Development",
    "Indie Games",
    "Unity",
    "C#",
    "Co-Op",
    "Procedural Generation",
    "Video Games",
    "SteamVR SDK",
    Experimental,
  ]
featured: "/images/flapper-feature.png"
---

"The Flapper" is a project that spawned out of a simple VR movement mechanic test that I had in my head for a while, which turned out to be surprisingly fun! The idea is to flap your arms to fly - wrapped up as a multiplayer battle to really get people moving.

In order to start working on this game, because there was so much standard VR code that I had to write for [Treekeepers](/treekeepers-vr), I decided to make a sort of engine out of the Treekeepers codebase and work off of that rather than start from scratch. That let me tie in some of the nice associated graphics, music and sound effects I had made, and a bunch of other helper functions and tools I use for things like the camera following around the character, how I deal with collisions, a bunch of netcode, etc.

You can see my more detailed post about that engine here: [Treekeepers Engine](/treekeepers-engine)

## Core Mechanic & Gameplay

Most of the start of this game was just tuning the movement mechanic, which borrowed from some physics realities and some elements I made up to make flapping feel good. But, the essential idea was that each arm generates unique thrust in the direction it moves with an exponential applied to its speed. It's hard to describe any native VR mechanic with words and videos only, but to me and the folks I demoed it to, it felt "right" for how flying should work if you did it by flapping your arms - and that feeling is based in the physical reality of wing-powered flight. I had a ton of fun just jetting around the obstacle courses I made for myself.

My idea for this other than just the mechanic was to make a sort of gorilla tag-esque multiplayer game where players would fly around and try to pop each other's balloons in an NES balloon fight {link} style. Ideally something like 15 to 20 people would be in a lobby flying around and trying to pop each other.

Like gorilla tag I didn't want anyone to have to "sit out" of the game, so it's essentially a deathmatch where the player who pops the most balloons wins, and is also visible who's winning, because they also gain the balloons that they pop. In some playtests players would have 20 or 30 balloons on their heads. This was my clever idea of adding a built-in rubber-band effect to the gameplay as well, since having more balloons over your head made you a bigger target to pop. The gameplay worked well - but I never quite got the game to a place with netcode and networking engine where multiplayer felt seamless enough.

Here’s a video of one of the later states of the game, where I have it fully networked and am testing with friends, though it still has a few bugs here:

{{< youtube Vxn8rDOZ7dU >}}

## Today

I stopped working on this project after about 3 months. It turned out that flying alone with this mechanic was very compelling (and also a great workout!) but the networking engine I had used for Treekeepers, Photon, was not up to the task for how low latency a competitive game needed to be. Treekeepers was four-player co-op so Photon was just fine.

In the future I might pick this one back up (or maybe have an AI agent pick it up for me depending on how that goes) using [space-time DB](https://spacetimedb.com/) which looks like a great solution for this type of game that doesn't require a whole ton of cloud programming and setup

I haven't made a build of this game public yet due to its unfinished and multiplayer nature - it's not set up with a usable server other than for testing. If I receive interest in playing it from enough people, I'll go back in and package up the single player parts as a tech demo and put a download here.

I learned a lot from this project, both in terms of game code organization and game mechanic design, and I still think it's a great concept. I hope this movement mechanic becomes the basis for a full game in the future and with any luck with the direction software development AI is going I might get that opportunity sooner vs later. About 3 weeks from now, I will be releasing an article on the modern state of AI software development, including a deep dive on some of the latest tools for web and game development, so stay tuned!

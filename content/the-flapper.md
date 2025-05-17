---
title: "The Flapper"
date: 2023-01-01
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
  ]
---

"The Flapper" is a project that spawned out of a simple VR movement mechanic test that I had had in my head for a while, which turned out to be surprisingly fun! The idea is to flap your arms to fly - and have it be a multiplayer battle to really get people moving.

In order to start working on this game, because there was so much standard VR code that I had to write for tree keepers, I decided to make a sort of engine out of tree keepers and work off of that rather than start from scratch. That let me tie in some of the nice associated graphics, music and sound effects I had made, and a bunch of other helper functions and things I use for things like the camera following around the character, how I deal with collisions, a bunch of netcode, etc.

You can see my more detailed post about that engine here: [Treekeepers Engine](/treekeepers-engine)

## Core Mechanic & Gameplay

Most of the start of this game was just tuning the movement mechanic, which borrowed from some physics realities and some elements I made up to make flapping feel good. But, the essential idea was that each arm would generate unique thrust in the direction it was moving with an exponenthel applied to how fast it was moving. It's hard to describe any native VR mechanic with words and videos only, but to me and the folks I demoed it to; it felt "right" for how flying should work if you did it by flapping your arms. I had a ton of fun just jetting around the obstacle courses I made for myself.

My idea for this other than just the mechanic was to make a sort of gorilla tag-esque multiplayer game where players would fly around and try to pop each other's balloons in a NES balloon fight {link} style. Ideally something like 15 to 20 people would be in a lobby flying around and trying to pop each other.

Like gorilla tag I didn't want anyone to have to "sit out" of the game, so it's essentially a deathmatch where the player who pops the most balloons wins, and is also visible who's winning, because they also gain the balloons that they pop. In some playtests players would have 20 or 30 balloons on their head. This was my clever idea of adding a built-in rubber-band effect to the gameplay as well, since having more balloons over your head made you a bigger target to pop. The gameplay worked well - but I never quite got the game to a place with netcode and networking engine where multiplayer felt seamless enough.

Here’s a video of one of the later states of the game, where I have it fully networked and am testing with friends, though it still has a few bugs here:

{{< youtube Vxn8rDOZ7dU >}}

## Today

I stopped working on this project after about 3 months. It turned out that flying alone with this mechanic was very compelling (and also a great workout!) but the networking engine I had used for Teeekeepers, Photon, was not up to task for how low latency a competitive game needed to be. Treekeepers was four-player co-op so photon was just fine.

In the future I might pick this one back up (or maybe have an AI agent pick it up for me depending on how that goes) using space-time DB {link}

which looks like a great solution for this type of game that doesn't require a whole ton of cloud programming and setup.

You can try a build of the game here:

{Download of latest build}

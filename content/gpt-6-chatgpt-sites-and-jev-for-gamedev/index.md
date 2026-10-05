---
title: "GPT-6, ChatGPT Sites, and Jev for Gamedev"
date: 2026-10-04
aliases: ["/preview/two-big-technology-updates-for-game-dev/"]
featured: "/gpt-6-chatgpt-sites-and-jev-for-gamedev/images/little-voyager.png"
featured_position: "left top"
categories: ["builds"]
tags:
  [
    "Game Development",
    "AI",
    "Unity",
    "Multiplayer",
    "Video Games",
    "AI Images",
    "software",
    "html",
    "javascript",
    "Rapid Prototyping",
    "Experimental",
  ]
---

I'm going to show you two experiments in game dev I've been working on for the past few weeks:

1. One through a new service called ChatGPT Sites, which uses ChatGPT Work to actually launch a website and host it publicly for you.
2. A very cool implementation of Jev, the [new decision making model from TypeSafe](https://typesafe.ai/blog/introducing-system-one-models-and-jev), where I replace my algorithmic computer AI with actual AI.

<!--more-->

## GPT-6 and ChatGPT Sites

I need to talk about this new feature of ChatGPT called "Sites". The premise is that you can just talk to ChatGPT and it will make a full website for you and deploy it on the internet for others to see.

But they're not just websites with CSS, HTML, and JavaScript: they can actually have a full backend, and ChatGPT will set up a SQLite database for you to track user data. There are services out there like this, but none so easy that you can literally chat and make a website, including database features, and have it just work out of the box. It's really quite incredible to work with.

For my first experiment with it, since GPT-6 Astra had just released, I decided to honor my tradition of testing the major GPT versions by building a dynamic solar system simulation like I did for [GPT-4](/gpt-4-solar-system/) and [GPT-5](/gpt5/#exhibit-a-a-new-solar-system). So I built a solar system simulation, better than ever, but this time it's not just a moving-to-scale simulation with some pretty graphics. It's also a full game where you can fly around and truly experience the scale of the solar system via a life-size astronaut and spaceship with highly unrealistic engine power and navigation mechanisms.

_And it's multiplayer!_ It was weirdly easy to implement multiplayer, and I know it's not great multiplayer, not super optimized, and other characters are jittery when they appear on your screen. But I cannot believe I just built and deployed a multiplayer game just by using my voice and didn't have to debug any netcode myself at all.

Check it out for yourself. If you're curious about space or have a child who is curious about the scale of the solar system and what it would be like to actually fly around it, I encourage you to try it with them.

{{< website-embed src="https://little-voyager.hockenmaier.chatgpt.site/" title="Little Voyager" caption="Try it out here though it's better fullscreen.  Zoom in and out to see the full scale of the solar system, and then actually fly through it and land on other planets!" >}}

## Jev, decision-making AI and the rise of promptable game bots.

Experiment number two was with something I just had to try immediately.

I am very excited for this new Jev model and its immediate clones. As someone who has been building with LLMs basically since the ChatGPT moment, I have seen the evolution from "write some code" or "write an essay" to "make these tool calls and give me these structured responses", as we progress from fun gimmicky chatbots to true automation. It just turns out most of the time what we actually want from LLMs is their smarts and not their verbiage. If we now get models with near frontier level intelligence but 100 times faster and cheaper structured responses, it could be a revelation for our AI apps.

So I signed up for this thing the day it was announced and got access that weekend and did a few experiments... but the coolest experiment was using LLM-level general intelligence to implement an actually quite smart NPC AI for my [balloon battle game that I posted about previously](/balloon-fight/).

{{< paige/youtube video="YFoZiwIbjEM" description="Balloon Fighter with Jev-powered computer players" >}}

What you're seeing here is me fighting some computer players that I very quickly wired up to understand the current state of any given game screen, as well as some basic facts like what's in front and behind them, where other players are in relation to them, that kind of thing. Keep in mind that Jev is still a text-input-only model, so we're trying to give it 2D data as text. Not only are we giving it all that general data, but every call gets every detail for every computer player, and this happens:

- every time a player goes above another player
- every time a player gets a power-up
- every time a player gets their balloon popped
- if none of this has happened for 2 seconds, every 2 seconds

Then Jev decides what each of the up to seven computer players will do, within about 200 ms of me asking.

The coolest part is difficulty is set by prompt! These range from player-by-player instructions to be extremely cautious, to aggressive to downright reckless - and those prompts totally change the behaviour of the bots as I play against them!

With not too much tuning, this is how they are performing. In some cases they are beating me at my own game!

I should say I have also experimented with some of the unofficial clones that run locally off Jev, and they are nowhere near as good or as fast. We'll see if we get Jev-like model competition, but for now this thing is in a class of its own.

Just a very cool experiment. Hard to believe we are here, getting frontier-level decisions in just a few hundred milliseconds, fast enough to give real-time inputs in a video game.

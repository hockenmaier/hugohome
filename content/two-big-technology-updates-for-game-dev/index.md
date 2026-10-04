---
title: "Two Big Technology Updates for Game Dev"
date: 2026-10-04
url: "/preview/two-big-technology-updates-for-game-dev/"
_build:
  list: never
  render: always
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
2. Another game dev experiment on a Unity game that I have half-developed, where I replace my algorithmic computer AI with the new [Jev model from TypeSafe](https://typesafe.ai/blog/introducing-system-one-models-and-jev).

<!--more-->

## ChatGPT Sites

I need to talk about this new feature of ChatGPT Sites because I feel like it's super underrated. The premise is that you can just talk to ChatGPT and it will make a full website for you and deploy it on the internet for others to see. You can deploy them publicly or let people log in with their ChatGPT logins.

But they're not just websites with CSS, HTML, and JavaScript: they can actually have a full backend, and ChatGPT will set up a SQLite database for you to track user data. There are services out there like this, but none so easy that you can literally chat and make a website, including database features, and have it just work out of the box. It's really quite incredible to work with.

For my first experiment with it, I decided to do the same thing I've been doing with the past GPT versions [here](/gpt-4-solar-system/) and [here](/gpt5/#exhibit-a-a-new-solar-system), because I was also trying out the new GPT-6 Astra model. So I built a solar system simulation. But this time it's not just a moving-to-scale simulation with some pretty graphics. It's also a full game where you can fly around and truly experience the scale of the solar system through variable engine speeds and navigation mechanisms. And it's multiplayer! It was weirdly easy to implement multiplayer, and I know it's not great multiplayer, not super optimized, and other characters are jittery when they appear on your screen. But I cannot believe I just built and deployed a multiplayer game just by using my voice and didn't have to debug any netcode myself at all.

Check it out for yourself. If you're curious about space or have a child who is curious about the scale of the solar system and what it would be like to actually fly around it, I encourage you to try it with them.

{{< website-embed src="https://little-voyager.hockenmaier.chatgpt.site/" title="Little Voyager" caption="Fly around the solar system in Little Voyager. For more room to play, open the game in a new tab." >}}

## Jev!

Experiment number two was with something I just had to try immediately.

I am very excited for this new Jev model. As someone who has been building with LLMs basically since the ChatGPT moment, I have seen my team evolve from mostly getting LLMs to write text and code to mostly getting LLMs to do tool calls and structured responses, as we progress from fun gimmicky chatbots to true automation. It just turns out most of the time what we actually want from LLMs is their smarts and not their verbiage. If we have this new model that is near the frontier level of intelligence but responds to structured response calls 100 times faster and cheaper, it could be a revelation for our AI apps.

So I signed up for this thing the day it was announced a couple weeks ago and got access that weekend and did a few experiments... but the coolest experiment was using LLM-level general intelligence to implement an actually quite smart NPC AI for my [balloon battle game that I posted about previously](/balloon-fight/).

<!-- TODO: Replace the placeholder below with the existing paige/youtube shortcode when the YouTube link is available. -->
> **Video coming soon:** Balloon Fighter with Jev-powered computer players.

What you're seeing here is me fighting some computer players that I very quickly wired up to understand the current state of any given game screen, as well as some basic facts like what's in front and behind them, where other players are in relation to them, that kind of thing. Keep in mind that Jev is still a text-input-only model, so we're trying to give it 2D data in text. Not only are we giving them all that data, but we are giving the model all of that data for every computer:

- every time a player goes above another player
- every time a player gets a power-up
- every time a player gets their balloon popped
- if none of this has happened for 2 seconds, every 2 seconds

And we are still getting good actions for every computer player, which is up to seven in this game, in about 200 ms after we ask.

And with not too much tuning, this is how they are performing. In some cases they are beating me at my own game!

I should say I have also experimented with some of the unofficial clones that run locally off Jev, and they are nowhere near as good or as fast. We'll see if we get Jev-like model competition, but for now this thing is in a class of its own.

Just a very cool experiment. I can't imagine that I'm here, getting LLM intelligence decisions in just a few hundred milliseconds, in time for it to actually decide real-time actions in a fast-paced video game.

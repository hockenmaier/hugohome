---
title: "The Real GPT-5 Was The Friends We Made Along The Way"
date: 2025-08-11
url: "/preview/agent-mode/" # any path you like
_build:
  list: never # don’t show in section/taxonomy/RSS lists
  render: always # still write the HTML file
categories: ["builds"]
tags: [AI, "Experimental", software, html, javascript, css, "Rapid Prototyping"]
featured: "/images/agent-mode-solar-system.gif"
---

> Warning: This article has a lot of embedded code, so [the ball machine](/this-website/#ball-machine---the-game) is slow unless you have a REALLY fast computer. Play at your own risk.

Seriously, though.

GPT-5, as a text completion model, is not a revelation. It's more of a disapointment.

This isn't so surprising. It was becoming clearer with every new raw LLM release that the fundamental improvements from scaling for just the performance of the core text predictor under the hood was starting to taper. But I'm going to make an argument today that, although the LLM itself is not nearly as much of a leap from GPT-4 as GPT-4 was from GPT-3, we have still seen at least a whole-version-number of real improvement between the release of GPT-4 and 5 as we did between 3 and 4. And the reasons for that are mostly what exists around that LLM core.

# Exhibit A

GPT-5 came at a great time for me, becuase when OpenAI set the announcement to 8/7/25, I was in the middle of stress testing Agent Mode with the prior models. So, let me start by just illustrating the progress we had made between the first GPT-4 release in early 2023 and the capabilities of GPT-4 level models the week before the release of GPT-5.

Two years and four months have gone by since I ran my original Interactive Solar System experiment with the original version of GPT-4. You can play with it at [hockenworks.com/gpt-4-solar-system](/gpt-4-solar-system).

Now have a look at the same test performed a week before the release of GPT-5, which uses ChatGPT Agent Mode:

<!--more-->

{{< agent-mode-solar-system-self-contained caption="Works on desktop or mobile" >}}

Here are Controls, again:

<kbd>Mouse Click + Drag</kbd> to move the solar system around

<kbd>Mouse Wheel Up</kbd> to zoom in from the cursor location

<kbd>Mouse Wheel Down</kbd> to zoom out

And I again used this initial prompt:

> I want you to make me a dynamic website. It should look good on mobile or on desktop, and I would like you to pick a nice dark background color and an interesting font to use across the page.
>
> The page is intended to show the scale of the solar system in an interactive way, primarily designed for children to zoom in and out of different parts of the solar system and see planets and the Sun in relative scale. Mouse controls should also include panning around the model solar system, and should include text around planets with some statistics about their size, gravity, atmospheres, and any other fun facts you think would be educational and fun for 10-12 year olds.
> &nbsp;

Quite an improvement, right?

Like my original experiment, I didn’t one-shot this result. This is the final result after 7 prompts, but unlike in the original, those followup prompts were not primarily fixes - they were new features that I thought would be good additions after playing with each previous version - all of which worked right away.

The most striking part of this experiment for me is that, despite the plateau that has largely been observed in base LLMs, this result is clearly far above and beyond what GPT-4 was able to do when it first released, and the reasons for that have to do with what the labs have been building _around_ the base models.

In the case of Agent mode, as far as we know, we have a GPT-4 class model at the root. o3, which is what Agent Mode uses, is a GPT-4 class model with chain of thought and lots of self-play training.

It also has the ability to use tools, like the web search tool it used to find the planet facts.

But then the thing that most sets it apart from its base model is the deep research and computer use elements of Agent mode. As it was building this model, I saw Agent mode do things such as perusing the internet with its text browser to find scale information and browse for textures it could use as planet skins.

It wrote and ran test code using its Code Interpreter tool.

It used its chain of thought "thinking" to respond to errors, rethink controls and scale decisions, and decide to go back and search the web or use other tools some more.

Then, the most impressive new ability that allowed it to make this: It ran this code on a local browser and _visually tested it_, clicking on the planets to make sure the information panels were coming up, zooming and panning around, and using its own toolbars.

This last one to me, when paired with all of the other things that GPT-4 class models are not instrumented to do, is the start of a true general capability for AI software testing, almost as a sidenote to all of the other things it will unlock in the coming few years. Not just the little unit and automated tests that LLMs have been writing into our codebases for a long time - but actual visual look and feel testing. This is a huge market and will be a huge shock to the software industry when it’s fully realized.

These are all net-new abilities that GPT-4 class models have gained since GPT-4 came out in March of 2023. It's hard to see how much progress these capabilities add up to without just running the direct experiment like this solar system generation

## GPT-5 Without Agent Mode

I see GPT-5 as a formalization of all of these capabilities that lock in the step change in capability. There is a new model underneath there somewhere (some are saying it is o4) and that underlying model has certainly been reinforcement-trained to choose its tools wisely. It is the first model I have seen that can do all of these simultaneously, without user choice:

- Choose when to think and when to just answer
- Run iterativeweb search calls
- Write and run code to do highly logical-symbolic tasks like data analysis
- Create, edit, and analyze images
- Create and read nearly any kind of document a user might be working with

And there are still a couple of things locked behind user choice, which is probably because these both result in much longer running and expensive tasks than simple thinking:

- Deep map-reduce style web research
- Computer use (mouse and keyboard style, with Agent Mode)

Using only the first set of "default" behaviours, GPT5 can do things that the original GPT-4 would never have dreamed of. I have had the following prompt sitting around in my "intelligence tests" document for more than a year now, waiting for a sinlge model that can one-shot it. GPT5 is the first one that does:

### Cool picross app idea, def solvable by competent AI (which doesn't exist yet at the end of 2024):

> Take an image, increase contrast, and turn it into a 15x15 image. Create a black and white picross puzzle out of the image, including a UI that lets a player solve the puzzle.

It's a simple prompt that implies a lot of underlying complexity. Here is the first one-shot result from GPT-5 I got (normal mode, I didn't select "Thinking" in advance):

{{< picross-generator-self-contained>}}

### Random Exponential Physics Sim:

{{< gpt5-exponential-bounce-self-contained>}}

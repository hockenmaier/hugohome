---
title: "The Real GPT-5 Was The Friends We Made Along The Way"
date: 2025-08-11
url: "/preview/gpt5/" # any path you like
_build:
  list: never # don’t show in section/taxonomy/RSS lists
  render: always # still write the HTML file
categories: ["builds"]
tags: [AI, "Experimental", software, html, javascript, css, "Rapid Prototyping"]
featured: "/images/agent-mode-solar-system.gif"
---

> Warning: This article has a lot of embedded code, so [the ball machine](/this-website/#ball-machine---the-game) is slow unless you have a REALLY fast computer. Play at your own risk.

Seriously, though.

GPT-5, as a text completion model, is not a revelation. It's more of a disappointment.

This isn't so surprising. It was becoming clearer with every new raw LLM release that the fundamental improvements from scaling solely the performance of the core text predictor were starting to show diminishing returns. But I'm going to make an argument today that, although the LLM itself is not nearly as much of a leap from GPT-4 as GPT-4 was from GPT-3, we have still seen at least a whole-version-number of real improvement between the release of GPT-4 and 5 as we did between 3 and 4. And the reasons for that are mostly what exists around that LLM core.

# Exhibit A: A New Solar System

GPT-5 came at a great time for me, because when OpenAI set the announcement to 8/7/25, I was in the middle of stress testing Agent Mode with the prior models. So, let me start by just illustrating the progress we had made between the first GPT-4 release in early 2023 and the capabilities of GPT-4 level models the week before the release of GPT-5.

Two years and four months have gone by since I ran my original Interactive Solar System experiment with the original version of GPT-4. You can play with it at [hockenworks.com/gpt-4-solar-system](/gpt-4-solar-system).

Now have a look at the same test performed a week before the release of GPT-5, which uses ChatGPT Agent Mode:

<!--more-->

{{< agent-mode-solar-system-self-contained caption="Works on desktop or mobile" >}}
{{< open-html "agent-mode-solar-system-self-contained.html" >}}

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

Like my original experiment, I didn’t one-shot this result. This is the final result after 7 prompts, but unlike in the original, those follow-up prompts were not primarily fixes - they were new features that I thought would be good additions after playing with each previous version - all of which worked right away.

The most striking part of this experiment for me is that, despite the plateau that has largely been observed in base LLMs, this result is clearly far above and beyond what GPT-4 was able to do when it first released, and the reasons for that have to do with what the labs have been building _around_ the base models.

In the case of Agent mode, as far as we know, we have a GPT-4 class model at the root. o3, which is what Agent Mode uses, is a GPT-4 class model with chain-of-thought and lots of self-play training.

It also has the ability to use tools, like the web search tool it used to find the planet facts.

But then the thing that most sets it apart from its base model is the deep research and computer use elements of Agent mode. As it was building this model, I saw Agent mode do things such as perusing the internet with its text browser to find scale information and browse for textures it could use as planet skins.

It wrote and ran test code using its Code Interpreter tool.

It used its chain-of-thought "thinking" to respond to errors, rethink controls and scale decisions, and decide to go back and search the web or use other tools some more.

Then, the most impressive new ability that allowed it to make this: It ran this code on a local browser and _visually tested it_, clicking on the planets to make sure the information panels were coming up, zooming and panning around, and using its own toolbars.

This last one to me, when paired with all of the other things that GPT-4 class models are not instrumented to do, is the start of a true general capability for AI software testing, almost as a side note to all of the other things it will unlock in the coming few years. Not just the little unit and automated tests that LLMs have been writing into our codebases for a long time - but actual visual look and feel testing. This is a huge market and will be a huge shock to the software industry when it’s fully realized.

These are all net-new abilities that GPT-4 class models have gained since GPT-4 came out in March of 2023. It's hard to see how much progress these capabilities add up to without just running the direct experiment like this solar system generation.

## GPT-5 Without Agent Mode

I see GPT-5 as a formalization of all of these capabilities that lock in the step change in capability we've seen over the last 2 years. There is a new model underneath there somewhere (some are saying it is o4) and that underlying model has certainly been reinforcement-trained to choose its tools wisely. It is the first model I have seen that can do all of these simultaneously, without user choice:

- Choose when to think and when to just answer
- Run iterative web search calls
- Write and run code to do highly logical-symbolic tasks like data analysis
- Create, edit, and analyze images
- Create and read nearly any kind of document a user might be working with

And there are still a couple of things locked behind user choice, which is probably because these both result in much longer running and expensive tasks than simple thinking:

- Deep map-reduce style web research
- Computer use (mouse and keyboard style, with Agent Mode)

Using only the first set of "default" behaviors, GPT-5 can do things that the original GPT-4 could never have dreamed of. I have had the following prompt sitting around in my "intelligence tests" document for more than a year now under _"Cool picross app idea, def solvable by competent AI (which doesn't exist yet at the end of 2024)"_, waiting for a single model that can one-shot it. GPT-5 is the first one that does:

### Exhibit B: Picross

> Take an image, increase contrast, and turn it into a 15x15 image. Create a black and white picross puzzle out of the image, including a UI that lets a player solve the puzzle.

It's a simple prompt that implies a lot of underlying complexity. Here is the first one-shot result from GPT-5 I got (normal mode, I didn't select "Thinking" in advance):

{{< picross-generator-self-contained>}}
{{< open-html "picross-generator.html" >}}

It didn't make all the choices I would have, but it worked in one shot, the first time I tried it. All the way from uploading an image and transforming that to a puzzle, to a whole UI that lets you solve it. I purposely left this here after its one-shot result just to demonstrate the progress here. You could take this idea much further.

### Exhibit C: The Baby Mesmerizer:

Now for the coolest thing I've made with GPT-5 so far. I call this one the baby mesmerizer because baby Alice is absolutely stunned every time she sees it. I got this idea from another entertaining little physics simulation I saw somewhere.

I had GPT-5 make this one, then I tested it using the built-in runner in ChatGPT, changed it, and iterated on it 16 times. But I didn't write any of it myself - nor did I even open the code other than to tweak some variables to make it "feel right" here and there.

{{< gpt5-exponential-bounce-self-contained>}}
{{< open-html "exponential_bounce.html" >}}

How cool is that?

I thought it was interesting that GPT-5, when I said that it needed to run as a single HTML file with no external dependencies, chose to write its own physics for this. There is no prebuilt physics engine at all here.

Let's be real: It's absolutely amazing that I could make something as complicated as this, exactly how I imagined it, just by describing it in English and a collective hour or two of testing. And though I like to code and have been bummed for a while that most straightforward coding like this is going the way of the dodo, this experience of not coding and instead just setting requirements and playing with the result was also a lot of fun. More fun than tearing through codespam in a tool like Cursor. And frankly, I would never spend time making something like this if I had to code it all from scratch.

# The Plateau

I've already read more than enough takes that GPT-5 signals the end of the current wave of AI, as a sort of intelligence plateau somewhere just below humans.

But, we should observe that we did not foresee the advancements that would get us from GPT-4 to GPT-5. Yet here we are: GPT-4 was barely able to write 200 lines of buggy solar system code, and GPT-5 one-shots it. The core model under the hood is likely a bit better, but it was proper tooling and reinforcement training on that tooling that really made the difference. And from what I hear, there are many other avenues that researchers say are still in early stages, which will get us much further, such as reinforcement training on long-running agentic tasks - and the synthetic datasets that will allow for it.

So, even though GPT-5 doesn't seem like a huge advancement from models like o3 and Sonnet 4, hindsight makes the upward trajectory clear. And no matter how fast we see progress, there is a ton of fun to have along the way!

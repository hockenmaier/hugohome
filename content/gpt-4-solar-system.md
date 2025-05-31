---
title: "GPT-4 Solar System"
date: 2023-03-18
categories: ["writing"]
tags: [AI, "Experimental", software, html, javascript, css, "Rapid Prototyping"]
featured: "/images/gpt-4-solar-system-featured.png"
---

I'm writing this post retrospectively as I never published it at the time of creation. It will live here as a "stake in the ground" of AI software capabilities as of March 2023. Note- if you're reading on substack, this post won't work. Go to [hockenworks.com/gpt-4-solar-system](hockenworks.com/gpt-4-solar-system/).

The interactive solar system below was created with minimal help from me, by the very first version of GPT-4, before even function calling was a feature. It was the first of an ongoing series of experiments to see what frontier models could do by themselves - and I'm posting it here because it was the earliest example I saved.

Here's a link to the chat where it was created, though it's not possible to continue this conversation directly since the model involved has long since been deprecated: https://chatgpt.com/share/683b5680-8ac8-8006-9493-37add8749387

<!--more-->

{{< solar-system-self-contained caption="GPT-4 only wrote this for desktop, sorry phone users" >}}

**Controls**

<kbd>Mouse Click + Drag</kbd> to move the solar system around

<kbd>Mouse Wheel Up</kbd> to zoom in from the cursor location

<kbd>Mouse Wheel Down</kbd> to zoom out

If you get lost, reload the page. That's an edge case GPT-4 didn't account for :)

Here was the initial prompt:

> This might be a long output, so if you need to break and I'll ask you to continue in another message feel free to do that. But please limit any non-code text prose to only essential statements to help mitigate this
>
> I want you to make me a dynamic website. It should look good on mobile or on desktop, and I would like you to pick a nice dark background color and an interesting font to use across the page.
>
> The page is intended to show the scale of the solar system in an interactive way, primarily designed for children to zoom in and out of different parts of the solar system and see planets and the Sun in relative scale. Mouse controls should also include panning around the model solar system, and should include text around planets with some statistics about their size, gravity, atmospheres, and any other fun facts you think would be educational and fun for 10-12 year olds.

Then I had to give it 4 more short prompts, one for a technical hint (to use html-5 since it was going a strange direction) and 3 for visual and mouse control misses.

It works - but missed some of the relatively simple directions, like the planet stats and rendering/controls for mobile. Still, I think it's cool to see the true scale of the planets on a zoomable canvas. And, it only goes to Neptune, the last true planet... don't go looking for Pluto.

For March 2023, this result was revolutionary - I was truly impressed. In 2025, it's not very impressive at all. How quickly we get used to progress!

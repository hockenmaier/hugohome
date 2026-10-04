---
title: "Building Skills that Pay the Bills"
date: 2026-09-01
url: "/preview/modeling-skills/"
_build:
  list: never
  render: always
categories: ["builds"]
tags:
  [
    "AI",
    "3D Modeling",
    "3D Printing",
    "openscad",
    "Hardware",
    "Bambulab X1",
    "Invention",
    "parenting",
  ]
featured: "modeling-skills/images/big-run-1.webp" # could be a .mp4, YouTube URL, whatever
---

This is a quick post on how I've been using skills within Claude Code in a pretty unique, non-software domain.

Skills were a very hot topic in AI a few months ago. The engineers I know use them all the time, but it seems like there is a perception that long-running, dynamic AI work of the kind that skills enable are "for software engineering" and not other kinds of work. So I wanted to provide an example of some very useful skills I'm using for a physical project.

Let's jump to the punchline. Here is what these skills are producing:

{{< round-gallery >}}
images/just-printed-1.webp|,
images/big-run-1.webp|
{{< /round-gallery >}}

The above pictures are marble run tracks, printed on my home printer, that fit perfectly into my daughter's magnetic tile-based marble run toy. Admittedly, at her age, these are more for me than her, but I am also sending some of these sets to friends with kids that love magnetic tiles.

I didn't actually design any of these parts. I used skills to pay some upfront labor in defining exactly how these parts should be constructed, and that enabled me to make incredibly simple text-based prompts, such as "design a wide 90 degree turn that happens across a 2x2 grid instead of the typical 1x1 grid." From these prompts, I'm getting perfectly snapping parts after Claude Opus 5 took 20 minutes or so to plan and execute the actual CAD modeling, which I have some prior tooling enabling that lets Claude Code render and take screenshots of models itself without any feedback from me. Sometimes Opus asks for clarification along the way, or commentary like "Sounds like what you need is a groin vault", but after this "skill building" I've done, the work is almost entirely on the AI to figure out and execute right up until the point I hit "print".

Because I put an hour or two into making these skills up front, as well as doing some test prints to make sure the connector parts would snap fit nicely, this became a 95% AI work task. I could spend my time just being creative and specifying what kind of tracks I wanted.

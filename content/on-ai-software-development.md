---
title: "On AI Software Development"
date: 2024-01-24
categories: ["writing"]
personal: "Y"
tags: ["software", "singularity", "AI"]
---

{{< image-medium
    src="images/ai-software-dev.png"
    alt="this is a robot"
    caption="" >}}

Lots of chatter right now about AI replacing software developers.

I agree - AI will take over software development. The question is: what work will be left when this happens?

Some considerations:

- Benchmarks for the best LLMs still put them solidly in the "bad at programming" category, scoring in the 5th percentile of human programmers on common tests. Meanwhile, LLMs score in the 80th-95th percentile for law exams and 85th–100th for psychology, statistics, and many other less technical fields. More scores available in the "simulated exams" section of https://openai.com/research/gpt-4.
- Engineers have been using language models like tabnine and copilot as "super-stackoverflow" style code assistance years before chatGPT released. This means much of the velocity increase we might expect from current LLMs' ability to write code has already been "priced in" to the market.
- Many of the trends making software development more costly are growing, not shrinking: Systems are becoming more distributed. The cloud lowered infrastructure costs but made applications more complex. We're making more and deeper integrations among disparate systems. Auth is becoming more secure and thus complex (managed identity, MFA, etc).

Github copilot chat and other LLM dev tools are speeding up the rote stuff. I’ve seen it in my own work.

And I really do believe new AI models will do more than just the basics, maybe in the next couple of years. Even precluding "AGI", the trend we are on is that more and more work is automatable, and engineers, especially more junior ones - are going to have to shift focus away from algorithmic work that AI can do.

But by the time our neural nets are "good enough" at building software to make it significantly cheaper to build, I doubt this trend will make the news. Everything else gets automated too.

These are my thoughts at what seems to be the beginning of the next AI revolution in early 2024. I plan to revisit this topic and see if I'm right in future posts.

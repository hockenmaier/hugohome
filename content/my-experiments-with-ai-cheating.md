---
title: "My Experiments with AI Cheating"
date: 2025-07-14
project-date: 2023-09-10
categories: ["builds"]
project_link: "https://github.com/hockenmaier/make-us-smarter"
github_link: "https://github.com/hockenmaier/make-us-smarter"
tags: ["Experimental", "AI", "Prototyping", "User Experience", "software"]
---

The advent of general coding AI assistants almost immediately changed how I thought about hiring and interviews.

In the software engineering world, this mindset shift was pretty easy for me psychologically, because I had always had a bias against the types of coding questions that I personally do badly at - the ones that require knowledge or rote memory of specific language capabilities, libraries, syntax. It is not that psychologically easy for everyone, especially those who have developed a core skill set of running or passing "leetcode-style" interviews. Even before AI, the only types of coding questions I would personally ask were things that simply evaluate whether a candidate is lying or not about whether they can code at all, which was and still is surprisingly common. I have interviewed people that list bullet points like 7 years of Java experience but can't pass a fizz-buzz like question, and this was a question I gave out on paper with a closed door and no significant time pressure.

So, when LLMs that could remember any syntax or attribute of any programming language perfectly were released, not only was I excited but I immediately saw that a huge chunk of the programming questions my team and many other software teams liked to ask were essentially irrelevant now, not only because people could cheat on interviews, at least virtually, but because that knowledge simply lost a lot of value overnight.

Over a few conversations with friends and colleagues I began to explore the idea of what this meant generally for the interview process. There are just lots of questions that we ask in every field, it turns out, that are mostly solved by LLMs today. These models have memorized most useful information that lets them ace simple interviewing questions across fields, even if the original intent of the question was to test for experience.

## The Build

In the summer of 2022 my ideas and conversations on this topic had gotten to the point where I really just needed to test my hypothesis - that LLMs and continuous audio transcription could let someone with no knowledge answer many interview questions correctly. My initial thought was that an app like this must already exist. But after searching for apps on the app stores that did what I was thinking of, I found that, surprisingly, none did.

I'm still not sure if that was a legal thing at the time, or if it's hard to get apps that continuously transcribe audio published, but as of 2025 apps like this definitely exist. Some of them have gotten famous and one has gotten its creator expelled from an Ivy League for revealing that he used it to ace interviews with some top tech companies. Link for the curious here:

https://cluely.com/

But, in mid 2023, these apps were apparently not a thing, so I decided to make a prototype.

My basic requirements were simply something that could continuously transcribe words being spoken in a meeting or over a call, group them up into meaningfully long chunks, and then send those to two different AI passes:

1. An AI pass that would try to make meaningful questions out of the transcribed potential gibberish
2. An AI pass that would answer those questions

My tech stack for this was a little weird, but I know Unity well and I don't know other ways of deploying native mobile apps well, and this definitely needed to be a mobile app if it was going to sit on the phone and continuously transcribe audio. Web has all kinds of restrictions on its APIs and I don't know native mobile web very well anyway.

This was surprisingly easy to do, even in 2023. I ran into a few hiccups mainly around continuous audio transcription, but for an app that I wasn't going to publish that I was directly putting onto my own Android device, I got around that by simply starting up a new audio transcription thread every time one closed.

{{< image-with-side-caption
    src="images/make-us-smarter.jpg"
    alt="the UI"
    maxwidth=200px
    caption="Super barebones UI just showing the continuously auto-transcribed words, questions derived from those words, and answers to those questions.  This particular screen was grabbed long after my API key had expired and is only here to show the basic output of the app, transcription building continuously in the background and detected questions and answers in the foreground." >}}

And the results were surprisingly compelling. Of course I was using some of the very first versions of GPT-4 and AI is still not perfect, but the main result of this was that occasionally questions were picked up that were not actually implied by the meeting audio, and occasionally real questions were missed. The part that I knew was going to work did indeed work incredibly well: when I simulated some fizz-buzz style questions and there were no major audio transcription issues, the second question-answering AI nailed them and was able to put a succinct script to answer the question on screen within a few seconds.

There was clearly more work to be done on UI and also the flow between the AI passes, and more agentic APIs of today could definitely do this all more seamlessly.

But for me, my question was answered: My hunch was right and we should definitely not be asking questions about basic constructs of programming languages or simple scripts in interviews anymore.

I open-sourced the project which is a pretty small Unity build, and it's a Unity version from a couple of years ago now, but anyone is welcome to look through and modify the code any way they want:

https://github.com/hockenmaier/make-us-smarter

## Interviewing Today

This whole experience has led me to an interview approach that I think is infallible (for now). And it doesn't require sending someone home with a project or any of that stuff that good candidates often don't even consider. I heard about a version of this technique on Twitter, so can't take full credit here:

First: ask candidates to bring some code that they have written, regardless of language or framework. Then simply walk through it with them in the interview. asking them questions about why they made certain decisions and trying to guide the conversation to parts that are technically interesting. It only takes 15 minutes or so, and it usually gets much better conversation going than sample interview questions do. This leans on the fact that you need an interviewer who can mostly understand most programming projects, but it cannot be faked with any LLM assistance. LLM-written code is typically pretty obvious: much better commented and differently organized than most humans would write. But even if the code was very sneakily written AI code that the person didn't contribute to, then having a human go through and explain the parts that they thought were clever defeats the purpose of cheating with AI anyway.

This is just a little tidbit of a technique that works well today, if the goal is to assess coding skills. Of course, it leaves some obvious lingering questions about what we are evaluating and why. I hope no one out there that I know is using these apps to cheat on interviews, but we all need to be wise to the fact that it is trivially easy to do so, and we should shift focus to testing for the qualities that actually matter in the era of AI - or at the very least techniques that prevent the types of cheating possible today.

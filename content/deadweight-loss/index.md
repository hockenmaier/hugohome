---
title: "Deadweight Loss: How much do you pay in taxes?"
date: 2026-03-29
categories: ["builds"]
tags:
  [
    "Experimental",
    "AI",
    "Prototyping",
    "User Experience",
    "software",
    "mobile",
    "codex",
    html,
    javascript,
    css,
    "Rapid Prototyping",
    wealth,
  ]
featured: "deadweight-loss/images/deadweight-featured.png"
---

It’s tax season! For the last few months I’ve been thinking a lot about taxes and saving for retirement. Do you know how much of your earnings go to taxes? I didn’t, not really.

I know my income tax bracket, and I know what I contribute to Social Security, but I don’t know how much I lose to tariffs and other sales/VAT taxes, payroll taxes, inflation, etc. And yes, I do consider inflation a regressive tax. As an econ student I was always more persuaded by [fresh-water economics](https://en.wikipedia.org/wiki/Saltwater_and_freshwater_economics).

And the biggest loss of all happens through compounding. Just like the important lesson many of us learned about the power of compounded savings, the losses due to all of these effects compound over your life via the same mechanism.

This mini-app has been on my list of things to build for a long time, but I’ve never had the time to actually gather all the data and make the simulation. Now I was able to build it in just a few days with deep research and Codex. And I named it after one of my [favorite econ terms](https://en.wikipedia.org/wiki/Deadweight_loss). It calculates your yearly loss to direct sources of tax and inflation, adds in the taxes paid before they hit your wallet, like payroll, then simulates wealth growth by various savings rates over your lifetime.

The app runs **entirely locally on your browser** - there is no logging or data collection of any kind.

While I was building it, I realized I may as well use the same parameters to build a “Financial Independence" calculator. Using [the 4% rule](https://en.wikipedia.org/wiki/Trinity_study) and combining these two focuses, it’s very interesting to see how taxes directly add working years before potential retirement.

This app will start with a LOT of assumptions, only asking you for five variables at first. That will give you a sense your tax loss and “FI” date, but many more variables can be tuned if you want a more accurate number to your specific situation. Not everything you might want is tunable, but this is going to be fairly accurate for you if you have a focus on saving. It will be less accurate, exaggerating your wealth potential, if your tendency is to spend up to your income. If you do find yourself tuning further, start by switching your state from California if you don't live here, and also adjusting your equities allocation if you don't target 90%. Those two items have a big impact.

Try pulling the tax levers. See what your numbers look like in a different state, or better yet if all your taxes were halved or doubled. You are going to be surprised by how these numbers change under different tax regimes.

Here you go. Have fun!

{{< tax-and-fi-calculator-self-contained >}}
{{< open-html "tax-and-fi-calculator.html" >}}

I love a good critique. If you throw this fully open-source code and math into an LLM, I am sure it will have a lot of comments and concerns about my calculations. I am happy to debate those in the [Substack](https://brianhockenmaier.substack.com/) comments!

Happy tax season and see you next time.

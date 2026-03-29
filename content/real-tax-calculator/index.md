---
title: "Deadweight Loss: How much do you pay in taxes?"
date: 2026-03-01
url: "/preview/tax-calc/" # any path you like
_build:
  list: never # don’t show in section/taxonomy/RSS lists
  render: always # still write the HTML file
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
  ]
---

It’s tax season! For the last few months I’ve been thinking a lot about taxes and saving for retirement. Do you know how much of your earnings go to taxes? I didn’t, not really.

I know my income tax bracket, and I know what I contribute to Social Security, but I don’t know how much I lose to tariffs and other sales/VAT taxes, payroll taxes, inflation, etc. And yes, I do consider inflation a regressive tax - I was an economics student after all.

But the biggest loss of all happens through compounding. Just like the important lesson many of us learned about the power of compounded savings, the losses due to all of these effects compound over your life via the same mechanism. You are going to be surprised by how these numbers change under different tax regimes.

This mini-app has been on my list of things to build for a long time, but I’ve never had the time to actually gather all the data and make the simulation. Now I was able to build it in just a few days with deep research and Codex:

It calculates your yearly loss to direct sources of tax and inflation, adds in the taxes paid before they hit your wallet, like payroll, then simulates wealth growth by various savings rates over your lifetime.

While I was building it, I realized I may as well use the same parameters to build a “Financial Independence" calculator. Using the 4% rule and combining these two focuses, it’s very interesting to see how taxes directly add working years before potential retirement.

The app runs entirely local on your browser - there is no logging or data collection of any kind.

This app will start with a LOT of assumptions, only asking you for five variables at first. This will give you a sense of the situation, but many more variables can be tuned if you want a more accurate number to your specific situation.

After you put in your numbers and see your initial loss to taxes and “FI” date, you can start pulling the tax levers. See what your numbers look like in a different state, or if all your taxes were halved or doubled.

Here you go. Have fun!

{{< tax-and-fi-calculator-self-contained >}}
{{< open-html "tax-and-fi-calculator.html" >}}

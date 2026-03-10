---
title: "What Percentage Of My Lifetime Wealth Is Transferring to the Government"
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

It's tax season, and the last few months I've been thinking a lot about taxes and retirement saving. Parenthood does things to you, man.

Do you know how much of your earnings go to taxes? I didn't, not really. I know my income tax bracket, and I know what I contribute to social security, but I don’t know how much I lose to tariffs and other sales/VAT taxes, payroll tax, inflation, etc. And yes, I do consider inflation a regressive tax - I was an economics student after all.

This mini-app has been on my list to build for a long time, but I’ve never had the time to actually gather all the data and make the simulation. Now I was able to build it in just a few days with deep research and Codex: It calculates not only direct yearly taxes, but the compounded loss over a lifetime of potential savings and eventual retirement, across all of the sources of loss.

While I was building it, I realized I may as well use the same parameters to build in a “Financial Indepence” calculator using the [4% rule](https://www.kohlercu.com/financial-wellness/this-that-and-chit-chat/understanding-the-4-rule-of-retirement-withdrawals): and combining these two focusses, it’s very interesting to see how taxes directly add working years before potential retirement.

The app runs entirely local on your browser - there is no logging or data collection of any kind.

This app will start with a LOT of assumptions, only asking you for 5 variables at first. But a lot more is tunable if you want a more accurate number.

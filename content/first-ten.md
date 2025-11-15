---
title: "First Ten"
date: 2018-05-19
categories: ["builds"]
personal: "Y"
stack: ["Python", "AWS Lambda", "Dialogflow"]
github_link: "https://github.com/hockenmaier/billofrights"
short_description: "An educational voice app about the U.S. Bill of Rights, accessible on Google devices and smart speakers."
tags:
  [
    "Voice Interface",
    "Serverless",
    "education",
    "AI",
    "Python",
    "AWS Lambda",
    "Dialogflow",
    "Rapid Prototyping",
    "Analytics",
  ]
---

> Editor's note from 2025:
>
> First Ten is no longer available after Google discontinued custom voice apps in 2023, but I'm leaving this article here as a record. Now, similar apps can be built in hours or minutes using modern AI models. First Ten used a now outdated intent routing system to fetch information from a serverless architecture about the Bill of Rights. Interestingly, my infrastructure for this app is still up and running behind the scenes because it's truly serverless and costs nothing to host.

First Ten is an educational app containing information about the U.S. Bill of Rights, accessible on Google devices and smart speakers.

It uses a VUI (voice user interface) only, meaning there is no visual way to interact with the app.

**Try it here:** [https://assistant.google.com/services/a/uid/00000036f6a580ed](https://assistant.google.com/services/a/uid/00000036f6a580ed)
Like Alexa skills, Google actions can be accessed through search or by simply asking for their names in Google Home smart speakers. Ask your Google Home or Android device, "Can I speak to First Ten?" in order to try it.

### Architecture

First Ten's backend is built in the serverless AWS services Lambda and DynamoDB, and its frontend—the engine that parses your voice into different "intents" and parameters—is built on Google's Dialogflow.
{{< image-medium
    src="images/first_ten_architecture.png"
    alt="Serverless Architecture of the First Ten app"
    caption="" >}}

---

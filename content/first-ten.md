---
title: "First Ten"
date: 2018-05-19
categories: ["project overview"]
personal: "Y"
stack: ["Python", "AWS Lambda", "Dialogflow"]
project_link: "https://assistant.google.com/services/a/uid/00000036f6a580ed"
github_link: "https://github.com/hockenmaier/billofrights"
short_description: "An educational voice app about the U.S. Bill of Rights, accessible on Google devices and smart speakers."
tags:
  [
    "Voice Interface",
    "Serverless",
    "Education",
    "AI",
    "Python",
    "AWS Lambda",
    "Dialogflow",
    "Rapid Prototyping",
    "Analytics",
  ]
---

First Ten is an educational app containing information about the U.S. Bill of Rights, accessible on Google devices and smart speakers. It uses a VUI (voice user interface) only, meaning there is no visual way to interact with the app.

**Try it here:** [https://assistant.google.com/services/a/uid/00000036f6a580ed](https://assistant.google.com/services/a/uid/00000036f6a580ed)
**Github:** [https://github.com/hockenmaier/billofrights](https://github.com/hockenmaier/billofrights)

Like Alexa skills, Google actions can be accessed through search or by simply asking for their names in Google Home smart speakers. Ask your Google Home or Android device, "Can I speak to First Ten?" in order to try it.

### Architecture

First Ten's backend is built in the serverless AWS services Lambda and DynamoDB, and its frontend—the engine that parses your voice into different "intents" and parameters—is built on Google's Dialogflow.
{{< image-medium
    src="images/first_ten_architecture.png"
    alt="Serverless Architecture of the First Ten app"
    caption="" >}}

---

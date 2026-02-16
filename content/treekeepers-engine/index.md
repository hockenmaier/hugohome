---
title: "Treekeepers Engine"
date: 2023-03-17
categories: ["builds"]
stack: ["Unity", "C#", "Photon Networking", "XR Toolkit"]
short_description: "An engine based on Treekeepers VR"
tags:
  [
    "VR",
    "Multiplayer",
    "Networking",
    "Crossplay",
    "Game Development",
    "Indie Games",
    "Unity",
    "C#",
    "Co-Op",
    "Procedural Generation",
    "Video Games",
    "SteamVR SDK",
    "Abstraction",
  ]
---

I made my latest Unity project into a multi-application "engine". I am now building and releasing two applications from one project. Let me show you how it works.

{{< image-medium
    src="images/treekeepers-app-switcher-1.gif"
    alt="Switching apps in the treekeepers engine"
    caption="Switching apps in the treekeepers engine" >}}

I did this because I had a lot of assets and code in Treekeepers that would directly translate to a new project I was prototyping. I considered other approaches - git submodules, unity packages, just cloning my old project. After a cost-benefit writeup I decided on this.

Now when I change variables, I edit a class called “Application Definition” for each application, which look like this:

{{< image-small
    src="images/treekeepers-app-switcher-2.png"
    alt="An applictaion definition in the editor"
    caption="" >}}

My plan is to use this new "Engine project" to not only update multiple games with common assets and code easily, but also as an instant starting point for any new networked VR/AR prototype.

As I go, any code I refactor to be generic across all projects goes in an Engine folder. Same for prefabs, materials, etc.

This way, if this gets cumbersome in the future, I can make a git submodule out of everything in "Engine" and import that into a new project.

Here are the scripts. The first runs via the Editor UI and takes variables for anything that needs to be different by project. The second file has the application definition classes you saw in the image above.

https://gist.github.com/hockenmaier/14d50ff0bb90aece1cc6de1b9fc5419d

{{< gist hockenmaier 14d50ff0bb90aece1cc6de1b9fc5419d >}}

The files are free to use. Check them out if you're in a similar situation, but be warned there are still some hard-coded things and references you’ll need to change.

Has anyone taken this approach before? Curious on other's take or approaches to similar problems!

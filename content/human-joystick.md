---
title: "Human Joystick VR"
date: 2020-01-01
categories: ["builds"]
personal: "Y"
stack: ["Unity", "C#", "SteamVR SDK"]
project_link: "https://github.com/hockenmaier/humanjoystick"
github_link: "https://github.com/hockenmaier/humanjoystick"
short_description: "An experimental VR locomotion system leveraging physical playspace movement."
tags:
  [
    "VR",
    "Experimental",
    "Game Development",
    "Unity",
    "SteamVR SDK",
    "3D Printing",
    "Video Games",
    "Prototyping",
    "User Experience",
  ]
featured: "images/human_joystick_centered.jpg"
---

The "Human Joystick" is an experimental VR movement system in which the player moves through the virtual environment by changing their physical location within their VR "playspace".

<!--more-->

{{< youtube q_1itpdiPb4 >}}

A demo of the human joystick movement system, showing how the system can work on flat surfaces or terrain.

This was my first barebones VR project. Though I knew Unity going in, VR and 3D games in general have a lot of unique aspects that I wanted to learn about while trying to solve an actual problem, rather than following tutorials or demos online.

VR has some adoption problems in its current state. We all know of some of the main problems- the clunky headset, the nausea issues, and of course the pricetag. But one major problem that you don't really notice until you get into it, is the lack of a good solution for virtual movement.

I had been wondering about "the human joystick" as a potential a solution to this particular problem ever since getting into consumer VR in 2016.

In most modern VR systems, the player can move physically around the room if they choose. Some applications and games depend on this - they put you in a small space and rely on your physical movement in order to reach different areas and interact with things. But games that provide a more traditional sense of scale and allow players to move through large worlds cannot rely on physical motion, because their users are constrained by physical space. Because of this, you see all kinds of "artificial" locomotion systems in order to let people move around - some just like traditional 2D games that let users "slide" their playspaces around the world using a joystick, and others that adopt teleportation mechanics. Neither feel very natural as compared to actually walking, and some can be downright sickening.

My goal with this project was to solve this problem with a mixture of physical and artificial movement.

It works like this: When the player is standing near the center of their playspace, physical VR movement applies. The player can move around and interact with things with their actual bodies. But once the player moves further from the center, the plaspace starts to move with them in the same direction as the vector from the center of the player's space to their current position. This allows for some of the benefits that physical movement experiences have, while allowing the players to more naturally move through an infinite amount of space.

I experimented with several speeds, both static and scaling with the distance between the center and the player. I also experimented with the size of the physical movement "deadzone" and with vertical and constrained movement across hills, valleys, and buildings.

---

| {{< paige/image src="images/human_joystick_centered.jpg" width="60%" style="display:block; margin:0 auto;" >}} | _View from the player's perspective looking at the guides at his feet. With the white dot in the red deadzone, the player isn't moving._         |
| :------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------- |
|  {{< paige/image src="images/human_joystick_moving.jpg" width="60%" style="display:block; margin:0 auto;" >}}  | **_When the white dot is in the green area, the player moves in that direction. Here I am moving forward and left at about half of max speed._** |

---

Eventually I found some good default values and the system worked, but there were some unforeseen problems: First, it was more difficult to center yourself within the playspace without looking at the visible guides I put at the player's feet than I expected. Second and more importantly, when you were already moving in one direction, it was not as simple as I thought to start moving in another direction accurately without fully returning to center, which was an immersion breaker.

Ultimately I put the project up for others to view but have not expanded it into a full experience or released it on any marketplaces. Feel free to download the Unity project and try it on your own VR setup if you're curious.

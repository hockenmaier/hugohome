---
title: "Treekeepers VR"
date: 2022-10-01
categories: ["project overview"]
personal: "Y"
stack: ["Unity", "C#", "Photon Networking", "XR Toolkit"]
project_link: "https://togetheragainstudios.com/treekeepersvr/"
github_link: ""
short_description: "A Co-op Networked VR Experience with Crossplay on Meta Quest and SteamVR"
tags: ["VR", "networking", "co-op", "crossplay"]
---
 
![The Treekeepers Puddle Jumper](/images/treekeepers_moonlight.png)

Treekeepers VR is a networked VR game where up to 4 players can cooperate to navigate an oversized world and save a giant tree.  

Treekeepers is in production on both Quest (standalone VR) and Steam (PC VR) with full cross-play functionality. See the [Treekeepers VR Website](https://togetheragainstudios.com/treekeepersvr/) for links to all storefronts and more detail about the game.  

---

## Development  

I began working on Treekeepers in June 2021, and my primary goal was to go significantly deeper into Unity and make a fully networked game. Very few co-op games existed in VR at the time (the area is still lacking), and my intention was to answer this need and create a game that 4 players could cooperate in within a static frame of reference (players move within a ship, and the ship moves through the world) while having to solve coordination challenges together.  

I initially designed the project for SteamVR only using the SteamVR SDK but quickly realized that a VR game released only on PC would miss the majority of the userbase, as the (then Oculus) Quest 2 was quickly dominating the market. Treekeepers was a good fit for a mobile platform with its simple low-poly cel-shaded design, so I pivoted to using OpenXR about two months into the project to support VR interactions on both PC and mobile (Android) devices like the Quest 2.  

By summer 2022, I had a releasable product, albeit only with one “world” available. I decided to push the game to early access to gather rapid feedback from real players, and after getting approved for both storefronts, Treekeepers released to early access on September 30, 2022.  

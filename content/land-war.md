---
title: "Land War"
date: 2019-03-01
categories: ["project overview"]
personal: "Y"
stack: ["Unity", "C#"]
project_link: "https://store.steampowered.com/app/1030960/Land_War/"
github_link: ""
short_description: "An 8-player real-time-strategy game with minimalistic art and deep strategic gameplay."
tags: ["Game Development", "Local Multiplayer", "Strategy", "Unity", "C#", "Indie Games", "Procedural Generation", "Video Games", "System Design", "Multiplayer"]

---

Land War is an 8-player strategy game I developed as a solo project and released to Steam in March of 2019.  
This game was intended to have low art requirements and simple interaction rules that result in deep strategic gameplay.

The core concept is that of an ultra-simplified real-time-strategy game. Each player is represented by a color and can grow their territory by moving in any direction. The strategic elements occur when players encounter other players and have to make choices about which side of their land to defend or give up. Players can use the structure of the map and the coordinated action of other players to gain defensible footholds in order to take more area and eventually be the last player on the board.

{{< youtube 5Q8PAuWcmQc >}}

A full game of the final product released on Steam played on a Windows computer.

### Development

I built Land War over the course of 7 months and 400 hours of work using Unity with C#. Though art requirements were intentionally low for a video game, I still had to produce several hundred static graphics and GIFs, and commissioned custom music for the menu and gameplay.

This project is one of my favorite examples of what can be done in relatively little time with a focused vision and a constant eye on scope creep. From the very start, I knew that a key to making compelling software was to flesh out the core concept before all else. This is why I started on the most fundamental strategic interaction of the players and built an MVP version of the game without a menu, sound, art, or even a win condition.

I started the project on a Memorial Day Monday, and by Friday had a rudimentary prototype playable with 8 players on Nintendo Joy-Con controllers paired to a Windows machine via Bluetooth.  
This is what the project looked like for my first play-test with other people 5 days in:

{{< image-large
    src="/images/land_war_mvp.gif"
    alt="Land War 4-day MVP"
    caption="4-player game played with Nintendo Joy-Cons on a build of the game from 5 days into development." >}}

From there, I continued to work on depth and full feature functionality including menus, a tutorial, a map generator, a dynamic scoring and round system, better sound and sprite graphics, different play modes and settings, and support for many controllers. I released the game with very little marketing aside from some Reddit posts and a physical handout at E3 but was happy to receive positive reviews and several hundred purchases of the game.

{{< image-large
    src="/images/land_war_player_select.png"
    alt="Player Select screen"
    caption="Player Select screen. Supporting menu and player controls across hundreds of controller types was one of the largest unforeseen challenges in developing Land War." >}}

{{< image-large
    src="/images/land_war_settings.png"
    alt="Settings menu"
    caption="Settings menu. Most interesting mechanics I found while developing the game were added as options to keep the game interesting here." >}}

{{< image-small
    src="/images/land_war_e3.png"
    alt="E3 marketing material"
    caption="The only physical marketing material developed for Land War. Several hundred Steam keys (copies of the game) were handed out during the E3 convention in 2019." >}}

{{< youtube BylKEPF4EeU >}}

_Land War's Steam release announcement trailer._

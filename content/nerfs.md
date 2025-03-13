---
title: "NeRFs in VR"
date: 2023-02-01
categories: ["project overview"]
draft: true
stack: ["Unity", "C#", "luma"]
github_link: ""
short_description: "An experiment with NeRFs"
tags: ["AI", "nerfs", "Unity", "C#", "Procedural Generation", "Video Games"]
---

I’ve been playing around with NeRFs lately and thought a fun way to explore them would be flying through them in the Treekeepers “Puddle Jumper” in true scale.

[[Insert video]]

Of course, you lose a lot of the draw of NeRFs when you export the model into a 3d engine because it has to flatten all the textures and lighting, and also Luma AI cuts off 3D model exports as a jarring cube

But still - I was amazed at how well just applying a day/night lighting cycle and mesh colliders worked with this. Projectile and enemy physics played well too.

It’s still early days, but I could see 3D model generation from this tech getting a lot better and forming the basis for some really interesting user-generated content in the future!

Neat stuff - big thanks to Luma AI for the free toolset.

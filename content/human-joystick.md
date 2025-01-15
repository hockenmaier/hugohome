---
title: "Human Joystick VR"
date: 2020-01-01
categories: ["project overview"]
personal: "Y"
stack: ["Unity", "C#", "SteamVR SDK"]
project_link: "https://github.com/hockenmaier/humanjoystick"
github_link: "https://github.com/hockenmaier/humanjoystick"
short_description: "An experimental VR locomotion system leveraging physical playspace movement."
tags: ["VR", "locomotion", "experimental"]
---

![Human Joystick centered](/images/human_joystick_centered.jpg)

**Human Joystick VR** explores a hybrid locomotion system where players move through a virtual environment by physically changing their position within their VR playspace.  

Link to the project: [Human Joystick on Github](https://github.com/hockenmaier/humanjoystick)

---

## Concept  

The "Human Joystick" solves a common VR problem: providing natural movement in large virtual environments. Players can physically move within a playspace, but once they approach the edge, the system detects the movement vector and shifts the playspace accordingly.  

This allows players to explore vast virtual spaces while maintaining immersion and reducing nausea.  

---

## Development  

This project was my first VR experience, designed to address virtual movement challenges. Inspired by consumer VR’s limitations in 2016, I aimed to merge physical and artificial locomotion for a more natural experience.

### Key Features:  

1. **Deadzone and active zone**:  
   - Players remain stationary when in the center (deadzone).  
   - Movement starts when stepping into the active zone.  

2. **Adjustable speed and direction**:  
   - Speed scales with distance from the center.  
   - Supports smooth transitions between directions.  

---

## Challenges  

Despite achieving basic functionality, there were usability issues:  

- **Recentering difficulty**: Players struggled to naturally return to the center without visual aids.  
- **Directional accuracy**: Switching movement directions without recentralizing was less intuitive than expected.  

---

## Demonstration  

Watch the system in action:  

{{< youtube q_1itpdiPb4 >}}

![Deadzone view](/images/human_joystick_centered.jpg)  
*View from the player's perspective in the deadzone.*

![Active zone movement](/images/human_joystick_moving.jpg)  
*Moving forward and left in the active zone at half max speed.*

---

## Conclusion  

Though the project remains a prototype, the system demonstrates the potential of combining physical and artificial movement for immersive VR. The code is available for download and experimentation on GitHub.  

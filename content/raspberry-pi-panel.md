---
title: "Raspberry Pi Control Panel"
date: 2016-01-01
categories: ["builds"]
personal: "Y"
stack: ["HTML/CSS", "Solidworks"]
project_link: "https://github.com/hockenmaier/RaspberryPiControlPanel"
github_link: "https://github.com/hockenmaier/RaspberryPiControlPanel"
short_description: "A home automation control panel built using Raspberry Pi and 3D-printed components."
tags:
  [
    "Home Automation",
    "3D Printing",
    "Hardware",
    "HTML",
    "CSS",
    "3D Modeling",
    "DIY",
    "Raspberry Pi",
    "System Design",
    "Experimental",
    "Hardware",
    software,
    Electronics,
  ]
featured: "images/raspberry-featured.png"
---

**Raspberry Pi Control Panel** is a hardware project I designed in 2016 to manage home automation systems. The project involved designing a custom 3D-printed case for a Raspberry Pi microcomputer with a touchscreen interface.

Links:

- [GitHub](https://github.com/hockenmaier/RaspberryPiControlPanel)
- [Thingiverse](https://www.thingiverse.com/thing:2524560)

<!--more-->

---

I created this panel display in 2016 to control much of the home automation I used in my Studio City apartment. Mainly a hardware project, I designed and 3D-printed a case and frame for the touchscreen and raspberry pi microcomputer in order to mount them to the wall. The software running the control panel is SaaS, but I did write a custom html wrapper to control the orientation and settings of the site, which is available on the github linked above.

Update in 2025: This panel is still my main view into my home automation in my new house in Sherman Oaks, almost 10 years in with no modification!

Here's a video to see the panel in action:

## {{< youtube iFGmm-ijJvE >}}

Feel free to explore the linked repositories for schematics and source code.

## Instructions

If you want to make this, all you need to do is set up a raspberry pi, download chromium (or your preferred web browser), and navigate to your action tiles panel.

If you want to mount the screen vertically like mine, then I have made an easier solution than going through the trouble of actually rotating the raspberry's display and touch device. Just use the html below and edit it to use your own panel's URL in the "iframe" element instead of mine. This will launch the panel rotated in your browser.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Rotated Raspberry Panel</title>
    <style type="text/css">
      body {
         -webkit-transform: rotate(90deg);
         -webkit-transform-origin: bottom left;
         position: absolute;
         top: -100vw;
         height: 100vw;
         width: 100vh;
         background-color: #000;
         color: #fff;
         overflow: hidden;"
      }
        iframe{

      	-ms-transform: scale(0.97);
      	-moz-transform: scale(0.97);
      	-o-transform: scale(0.97);
      	-webkit-transform: scale(0.97);
      	transform: scale(0.97);

      	-ms-transform-origin: 0 0;
      	-moz-transform-origin: 0 0;
      	-o-transform-origin: 0 0;
      	-webkit-transform-origin: 0 0;
      	transform-origin: 0 0;
      }
    </style>
  </head>
  <body>
    <iframe
      src="https://app.actiontiles.com/panel/f7a7118c-236b-4144-b5b9-ccb35abeef21"
      height="300%"
      width="300%"
      frameborder="0"
    ></iframe>
  </body>
</html>
```

Link to buy the screen:
https://smile.amazon.com/gp/product/B01ID5BQTC/

Link to the Action Tiles web application this is running:
https://www.actiontiles.com/

If you have issues getting your pi to use the full touchscreen width, try adding these setting to the /boot/config.txt file and reboot:

```bash
max_usb_current=1
hdmi_group=2
hdmi_mode=1
hdmi_mode=87
hdmi_cvt 800 480 60 6 0 0 0
```

If you want to make sure your screen doesn't go to sleep:

```bash
sudo nano /etc/lightdm/lightdm.conf
```

Add the following lines to the [SeatDefaults] section:

```bash
xserver-command=X -s 0 dpms
```

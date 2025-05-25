---
title: "Vision is the last hurdle before AGI"
date: 2025-02-01
categories: ["writing"]
tags: ["singularity", "AI", "Invention", "predictions"]
---

I have long been of the mind LLMs and their evolutions are truly thinking, and that they are on their way to solving all of the intellectual tasks that humans can solve today. It is just too uncanny that the technology that seems to have made the final jump to actually thinking, after a long string of attempts and architectures, is a type of neural net. It would be much easier to argue away transformer models as non-thinking stochastic parrots if we had happened to have had success with any other architecture than the one that was designed to mimic our own brains and the neurons firing off to one another within them. It's just too weird. They are shaped like us, they sound like us in a lot of ways, and it's obvious they are thinking something like us too.

## The Limitations

That's not to say they are AGI in the modern definition. They can't do every task humans can do intellectually (IE without a body, which I will get to) for several reasons:

1. Looping reasoning.
   This was a huge problem for early transformers that had to output in one shot, and the examples were obvious. This one has been essentially solved via thinking models like o1. That was a huge unlock and a huge bone for things like programming where there is lots of nested recursion of logic that has to occur to get a reasonable answer.

2. Memory and context.
   Context windows get larger all the time but this one still is not solved. Just adding a bunch of tokens into a context window doesn't get you much when 2 million token models lose coherence after about the first 40,000 - which they do, and which every programmer working with anything but a tiny codebase intuitively understands. But this one too will largely be solved soon, if not through architectures that actually update their weights, it'll be solved through nuanced memory systems that people are actively developing on top of thinking models.

3. Vision

And this one might sound funny to someone that is paying attention to AI in particular, because GPT-4 with vision launched something like 2 years ago now. And it has been impressive for a long time, able to do things like identify what objects are in an image, where an image is from, even things that payments can't do glancing at an image.

But the vision itself is not “good” vision. It cannot really pick out small important details, and it still behaves in many ways like vision recognition models have for years now. Now that we have a model that has both thinking and image input and editing at every step, the 03 and 04 mini series just released, we can really start to see the limitations in vision. Let me take you through 2 examples that represent the 2 types of failure modes that result from these not having true image understanding, yet.

Each release from the major providers steadily knocks away my intelligence tests, which I admit are mostly programming oriented, but the ones that they can never really dent are the spatial reasoning ones where a model really has to think about images in its head or have to use an image provided for detailed work.

### Simple 3D Modeling

Every major model release, [I test what models can do with OpenSCAD](/3d-modeling-with-ai). I won’t get technical about it here, but OpenSCAD is a CAD program (Computer Aided Design - think 3D modeling for engineers, not the artistic kind) that is defined entirely through a programming language vs the typical mousestrokes and key presses that software like Solidworks or AutoCAD depend on.

This makes OpenSCAD the perfect test platform for a model that inputs and output text primarily. I can describe a 3D model I want, and the model can output text that renders into a 3D model.

But for as amazing as LLMs are at scripting in normal programming languages, they have never been good at OpenScad (link to GPT4 chair article)

Here is O3’s attempt to make a

### Map Reading

I recently gave this question to the latest thinking image model, '03: "Here's an image from Google maps of the block I live on between the avenues of Burbank, hazeltine, Oxnard, and Van nuys. What is the longest continuous loop I can walk within the neighborhood without crossing my path or touching one of the avenues? This square is 1/2 mi on each side"

{{< image-small
    src="images/o3-struggle-map.png"
    alt="the uploaded map"
    caption="The image uploaded with this query" >}}

O3 thinks for 4 minutes about this question, zooming in to various parts of the map countless times to form the route. And then it fails on the first step, suggesting starting at tiara and stansbury, which do not intersect on the map. Any person looking at this image could tell that is true in just a few seconds.

What I think is going on in these examples is that we have a limitation in training data (duh) but it isn't because there aren't a lot of images and videos on the internet, it's because there is so much more information in the average image then there is in the average chunk of text, and a lot more of that information is irrelevant to any given question.

When I say that we have a limitation on training data, I'm not in the typical camp of "well, then transformer neural nets are obviously stupid because I was able to understand this thing without training on terabytes of data from the internet". This is always been a bad take because the average human trains on petabytes, not terabytes of data, and that data is streamed into their brains mostly in the form of images. I am also not in the camp of thinking that this means that the data "just doesn't exist" to get these models to AGI in this dimension. It's so clearly does exist, and it exists so abundantly that a unique mage stream can be sent to each of the billions of human brains, and they all learn the same principles that let them immediately identify the mistake that the cutting edge thinking vision model made after 4 minutes of rigor.

The data exists, and we never actually had a data problem in AI. We have an instruction problem. That doesn't mean model architecture or data massaging really, it means that we need to plug our models into the real world where all the data streams exist. I'm guessing that this comes in the form of robots with cameras on them, the first of which is happening on mass via Tesla full self-driving, and I'm sure those vision neural nets are quite insane compared to what we see in the consumer transform r models, but the real leap probably comes when we get to humanoids walking around collecting and learning from vision data everyday.

The Robots

If you’ve ever tried to get concrete actions to take based on a vision-transformer’s outputs, you will know it’s hard.

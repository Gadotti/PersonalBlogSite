---
title: "USB hacking: The power of the Arduino Digispark"
date: 2019-11-20 17:50:14
tags: ["arduino", "hacking"]
cover: /imgs/digispark/banner.jfif
translation_key: usb-hacking-digispark
translated_by: ai-reviewed
---
# USB hacking: The power of the Arduino Digispark

Imagine that just plugging in a USB device could, within seconds, install a *backdoor*, steal browser passwords, grab *Wi-Fi* passwords, extract or delete documents, create admin users, or install *malware* or *loggers* on a machine.

Now imagine the attacker wouldn't even need to do the dirty work themselves — all it takes is convincing the right person to check out a "found" USB stick, plug in an innocent-looking mouse, or just charge their phone with a power bank.

What used to require relatively expensive equipment is now within reach for as little as **R$ 15.00** (Brazilian reais) and a bit of imagination.

What follows are proof-of-concept demos built with the **Arduino Digispark**, a board that emulates a keyboard and runs whatever you program into it, with a speed and precision no human could match by hand.

The Arduino Digispark measures about 2cm x 2cm and can be built into all kinds of devices, with both digital and analog inputs.

![Arduino Digispark](/imgs/digispark/arduino_scheme.jfif)

Below are a few implementations I built, adapted, and tested for this demo — all you need to do is plug the device into a computer's USB port.

## Stealing Wi-Fi passwords and emailing them out

This task collects every Wi-Fi network the computer has ever connected to, pulling out the passwords saved for automatic reconnection, then exports that data to a .csv file. It could stop there, but why not go ahead and email that list out too? So the file gets sent to a preset email address along with the results, and the original file is deleted, leaving no trace of what happened.

[Video demo](https://www.youtube.com/watch?v=uzV_kIC-1_o)

## Creating a user with administrator privileges

If the goal is to open up privileged access for later use, this task handles that too. The script creates a new user and adds it to the machine's administrators group, which can then serve as a vector for further exploitation down the line.

![User privileges](/imgs/digispark/user_privileges.png)

## Reverse shell

If all that still isn't enough, why not open a backdoor to a remote machine? Running this script establishes a connection to a given machine, making it possible to execute any command remotely. The script also pops up a fake Windows Update screen to buy a bit more time while the shell stays open.

View from the victim's machine
![User privileges](/imgs/digispark/windows_update.png)

View from the attacker's machine, with access to the victim's machine:
![User privileges](/imgs/digispark/reverse_shell_kali.png)
![User privileges](/imgs/digispark/reverse_shell_kali2.png)

## Conclusion

The only real limit here is creativity, since once the device is plugged in, any programmed command can run. Other examples would include stealing passwords saved in browsers, installing malware, installing viruses, keyloggers, destroying data on the machine, or moving laterally once inside a corporate network.

A few challenges had to be worked through to prove the concept, the main one being the keyboard layout Arduino uses. The board ships mapped to the **en-US** layout by default, so it was necessary to rewrite an intermediate library, remapping the hex addresses of each key to the **pt-BR** layout, since the whole point of the project was to use it in Brazil — which is how the **'DigiKeyboardPtBr'** library came about.

Other details, like accented characters and Windows command syntax in Portuguese, also had to be mapped out.


The complete project, with the scripts mentioned here fully documented, is available at <https://github.com/gadotti>

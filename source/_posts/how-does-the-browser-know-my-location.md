---
title: How does the browser know my location
date: 2019-07-27 19:44:50
tags:
---
![My location](/imgs/location/banner.jfif)

When your browser asks if you want to share your location, do you have any idea how it gets this information? Even if your computer is a desktop, no built-in GPS, or even if you have taken any other action that might indicate the location of the computer? Hold this question as we try to build this path together.

Inspired by *Gabriel Pato's* video ([Rastreando o Endereço da Internet de Alguém: É Possível?](https://www.youtube.com/watch?v=6WZox0-Tc3k&feature=youtu.be)), I was provoked to try to see for myself how this was working. I confess it was not as simple and magical as it was on the video, I had some technical challenges, but in the end I got the result I was looking for.

Well, when you go on a website that displays that "*Do you allow 'siteY.com' to access your location?*" message, it means that the developer of that application triggered the javascript command "*navigator.geolocation.getCurrentPosition (function () {})*", available on browsers that support HTML 5.
No alt text provided for this image

![Question](/imgs/location/1_question.png)

## Step 1: Trying to reproduce behavior

To simulate, besides the main call, I incremented a function to see the result directly on screen and then wrote it on the browser console:

```
function showPosition (position) {
    alert ("Latitude:" + position.coords.latitude + 
           "Longitude:" + position.coords.longitude);
    navigator.geolocation.getCurrentPosition (showPosition);
}```

![Js Code](/imgs/location/2_jscode.png)

## Step 2: Trying to intercept the request

After simulating the request, I needed to intercept the command that is sent by the browser.

My first option was to use Burp, which I already have some background. But after several attempts and configuration changes, simply requesting the 'location' didn't stop at my proxy. So I went to '[Charles](https://www.charlesproxy.com)', another tool that despite being paid, I was still entitled to the 30-day free trial.

Using '*Charles*' I was more successful, all my requests were being listed in the proxy, including the location ones. But there was still a problem, they were encrypted as I was requesting from HTTPS sites. My idea of requesting from an HTTP site was also frustrated as Google returns an error stating that the request is not being made through a secure environment (nice!).

By the way, this function triggers a Google API, even on FireFox.

OK then. I needed to install the certificate provided by '*Charles*' and tell the browser to trust this certificate. It worked for normal requests, but still, for the location request didn't seem to be enough. I had no way of telling this particular request to trust my certificate. I needed to make the browser trust my certificate by default without having to indicate it out to him. This is possible by changing the location where the certificate is installed. That's what I did and voilà, done. Then I could intercept the request and also read in plain text the message that is sent.

![Proxy](/imgs/location/3_proxy.png)

## Step 3: Identifying the information sent from my machine

After getting the information in plain text, it was possible to identify that a block of text in JSON format is sent through a list with items containing 3 properties: age, mac address and signal strength. In my case, the list contained 6 items.

![Json Result](/imgs/location/4_jsonresult.png)

The first element I identified was referring to my own router, but what about the rest? It wasn't from any equipment in my house, was it my neighbors' nets?

I used the '[NetSpot](https://www.netspotapp.com/)' program to scan my neighbors network, listing network names, mac addresses and signal strength for comparison. It was a surprise when I made a comparison and was able to relate each mac address to some nearby network.

![Proxy](/imgs/location/5_jsonrelation.png)

## Step 4: Repeating the request by editing json

For study purposes using '*Charles*' compose, I resent several requests editing the content to see the return differences. I realized that one element or another influenced a lot or sometimes nothing about the location. The more information, the more accurate the location indicated, as expected.

And if I'm on a wired network, no wifi and no gps available, what happens?

I also tested this scenario and the content that is submitted is empty. That is, no mac address is sent, but the API still manages to return an approximate location in my neighborhood. What information did Google consider then?

## Conclusions:

Reading [Google's policies](https://policies.google.com/technologies/location-data) makes it pretty vague how mac addresses are collected, stored and processed. One of the assumptions is that the Google's car that scan to Google Maps also scans the networks and relates to the locations on the map, but let's face it, it wouldn't be enough, this data would become obsolete faster than the map is updated.

We know it is possible to identify a location from our IP address, but that location is quite wide and no longer accurate when Google responds with a location, even without sending any mac addresses from surrounding networks. I also don't believe that internet companies share this information with Google in real time and the processing time is incredibly fast to depend on third parties.

There is a parallel service that gives you an idea of how Google has been storing this information, through the [Wigle.net](https://wigle.net/) website you can view a map of mac addresses from worldwide collaboratively collected. The amount of information this site presents is impressive, especially having in mind that it was only collected collaboratively, so imagine how this map looks like on Google's service?

I understand that the way to calculate the location should not only be based on these mac addresses, a lot should be taken into account, such as: ip address, search history, gps, wifi's, location history, my Google account, etc.

What bothers me is that even denying the location sharing of these sites, my neighbor can accept and then my mac address is collected, sent, processed and stored. I did not accept any of this, I did not give permission, and I did not accept any terms when my neighbor send my information revealing my location by proximity to other addresses they shared or will share.

Do you agree how your information is collected arbitrarily? How do you think your location is calculated?
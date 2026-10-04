---
title: "What nobody tells you about bug bounties"
date: 2021-08-07 14:30:00
tags: ["security","bugbounty"]
translation_key: bugbounty
translated_by: ai-reviewed
---

## What nobody tells you about bug bounties
It's the buzzword, the hype of the moment in the tech world. Headlines about explosive data breaches. Stories of kids earning thousands upon thousands of dollars in rewards for flaws they found and reported to big companies. Nothing lights up the eyes of someone hungry for easy money like dollar figures on a screen.

And that's the starting gun for the world of *bug bounties*, which attracts all kinds of people. Courses promising your first *bug bounty* payout in **4 months**, *workshops*, books, and all of it, of course, for a "small" fee. After all, what's R$100, R$500 or even R$2,000 (Brazilian reais) when you could win **$100,000**, right?

The truth is, it doesn't work that way. A normal person doesn't learn everything they need to know about information security in 4 months. And someone who enters this field purely for the chance at a big payout won't stay motivated to follow the path. **The truth is that there are no shortcuts to learning**.

Here's another hard reality: do you believe companies really want to pay you a reward? If you do, you're naive. The truth is they will do whatever it takes to call your report invalid, not applicable, not a risk, a duplicate, or simply something they won't fix even if it's valid. And so you get a *pat on the back* and a "thanks for your effort."

But the people who want to take your money won't tell you that, of course not. I've seen reports calling out profiles that post fake *screenshots* of the rewards they supposedly received, all to lure people into this "business," which has started to look like the promise of astronomical returns from "investing" in *day trading*. Be careful.

## Case studies

I've submitted plenty of reports on different platforms and have received every kind of response imaginable, and the lack of seriousness in some companies' analysis is plain to see. Here are a few examples:

#### Case 1
I reported that, in a certain instant messaging app, the second-factor check at login has a validation flaw involving unauthorized IPs. The authorization can be completed from a completely different IP address than the one used to log in. What's the logic behind that kind of security? I don't know, but the company apparently sees no problem, as you can see from the response I received in the screenshot below.

![Case 1 HackerOne](/imgs/bugbountys/1-HackerOne.PNG)

#### Case 2
In another instant messaging app, I reported that the user's session isn't invalidated when they log out, on both the web and desktop versions.

Picture yourself at a public computer. You log in to exchange a few messages, and when you click "Log out" you think your account is protected. In reality, anyone who grabs the session from your browser (*which, by the way, isn't protected from JavaScript access; it sits in the browser's LocalStorage*) can impersonate you with full access.

I had to submit the report **twice**, because the first time it was rejected without them even understanding what the problem was. The second time, after a long wait and a lot of effort proving it was a problem and showing the best practices based on OWASP, the disappointing answer came, shown in the screenshot below: yes, the submission is valid, but they flagged it for a future product review, so there's no date for a fix and, of course, no bounty, even if they decide to fix it tomorrow. "**A pat on the back and thanks**"

![Case 2 Private](/imgs/bugbountys/2-Private.PNG)

#### Cases 3, 4 and 5
Here are more screenshots of various reports on other platforms. These are examples where they simply say they won't fix it, it isn't valid, it's a duplicate, or they downgrade the severity so they can accept it without paying a *bounty*. Oddly enough, 3 of my reports were completely anonymized. Why? If they fix the issue later, I have no way left to prove I reported it.

**Proof that login rate limiting isn't enforced:**
![Case 3 Bugcrowd](/imgs/bugbountys/3-BugCrowd.PNG)

**Report completely anonymized after a while:**
![Case 4 Bugcrowd](/imgs/bugbountys/4-BugCrowd.PNG)

**Other reports completely anonymized:**
![Case 5 Bugcrowd](/imgs/bugbountys/5-BugCrowd.PNG)

## Conclusion

There is no real commitment, and no guarantee you'll get paid, even though, yes, payouts do happen. But no legal contract will defend or protect you.

That said, I'm not trying to talk anyone out of this activity, far from it, but if you do it, do it with open eyes. Don't do it for the *bounty* alone. Use it as training to sharpen your skills, and don't let it be your only motivation. Remember, **great professionals don't make a living from bug bounties**, and there's a reason for that: **there's no consistency**.

**Happy studying!**

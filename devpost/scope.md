---
doc: scope
status: approved
---

# Previously On

A Discord bot that remembers what your server said and tells it back like a TV show.

## The Unique Kernel
The server is a TV show. `/previously` gives you the "previously on" recap of what you missed, and a question that was already answered gets called out as a "rerun" with a link to the episode where it aired. Every recap line and every rerun points to a real message you can click: if it can't be linked, it isn't said.

## Who It's For
People in busy community servers (crypto, gaming, study groups, open source) who come back to hundreds of unread messages, and the mods who answer "wen airdrop?" for the 48th time. Today they scroll for ages or give up, then ask a question that was answered an hour ago. Mods retype the same answer, and pinned FAQs go stale because nobody reads them.

## The Core Loop
You come back to a channel and type `/previously`. You get 4 to 6 short TV narrator lines covering what you missed since you last spoke there, each with a jump link. You click into the one that matters.
In the background, when someone asks something the channel already answered, the bot replies quietly with "📺 Rerun!", the old answer's link and how many times it's been asked.
People come back because catching up takes 15 seconds instead of 15 minutes, and mods stop being a human FAQ.

## Inspiration & Identity
The "previously on..." segment at the start of TV episodes: short, dramatic, only what matters. Old TV vibe. Funny, never mean: reruns are a nudge, not a public roast.

## Why This Matters to the Learner
"I do community and social for a few projects, so I live in Discord and Telegram all day... I'm the person answering 'wen airdrop' at 1am." Wants to learn how to make an AI summarise chaos without making things up.

## What "Working" Looks Like
In a test server with a few hundred realistic messages:
1. `/previously` returns, within about 15 seconds, a recap of 4 to 6 narrator style lines, each with a working jump link to the real message.
2. Someone asks a question a mod already answered earlier in the channel: the bot replies "📺 Rerun!" with the link to the old answer and a times asked counter.
3. Someone asks a brand new question: the bot stays quiet.

The "oh, that's cool" beat: someone types `/previously` after a chaotic day, gets a dramatic recap, then asks the classic question and gets a rerun.

## The POC Boundary
- Discord only, one test server.
- `/previously` for the channel it's used in, covering messages since the user last spoke there (or the last 24 hours).
- Reruns in channels the bot can read.
- Every output line links to a real message.

## Later
- A trailer voice narrating the recap.
- Telegram (its bots can't read past history, so it needs a different approach).
- A whole server recap and a weekly "season finale".
- Mods marking the official answer to a question.

## Explicitly Cut
- Web dashboard: Discord itself is the interface.
- Accounts and payments: nothing to sell in a proof of concept.
- Multi language: the test server is English.

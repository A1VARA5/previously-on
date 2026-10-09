---
doc: prd
status: approved
---

# Previously On: Product Requirements

A Discord bot for people in busy community servers and their mods: catch up with a TV style recap, and stop answering the same question forever.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. A server admin invites Previously On to the server. It needs to read messages and history in the channels it should watch.
2. Someone comes back to a busy channel after a while and types `/previously`.
3. The bot works out where they left off: their last message in that channel, or 24 hours ago if they haven't posted recently.
4. Within about 15 seconds, only they see a reply titled "📺 Previously on #channel" with 4 to 6 narrator lines, each ending in a jump link to the real message it's based on.
5. They click a link to jump straight into the bit that matters.
6. Later, someone else asks "wen airdrop??". A mod already answered that earlier in the channel.
7. The bot replies to that message, without pinging anyone: "📺 Rerun! This episode already aired on Sep 3, here's what the mod said 👉 [link]. Times asked: 48 💀"
8. Someone asks something new. The bot says nothing.

Success: the person caught up without scrolling, and the mod didn't have to type anything.

## Screens and Layout
There's no app to open. The bot lives inside Discord, so its surfaces are:
- **The `/previously` command**: a slash command with no required options.
- **The recap reply**: a Discord embed only the person who asked can see. Title "📺 Previously on #channel", a one line "since you left" time, then the narrator lines, each with its jump link. A small footer with how many messages it read.
- **The rerun reply**: a short normal reply to the question, no ping, so it's a nudge and not a callout.

## Look and Feel
Source: `scope.md > Inspiration & Identity`.
- The voice of a TV narrator doing a "previously on": short, dramatic, a bit funny, never mean.
- Old TV vibe: 📺 as the signature, a dark muted embed colour like a switched off CRT.
- Emoji only where a narrator would pause (📺 for the show, 💀 for the counter).
- Recap lines are one sentence each. No walls of text, no bullet point minutes.
- Reruns are small. The joke is the counter, never the person.

## Features and Behavior

### The recap (`/previously`)
- As someone coming back to a busy channel, I want a short recap of what I missed so I can catch up in seconds.
  - [ ] Typing `/previously` in a channel returns a recap within about 15 seconds.
  - [ ] Only the person who asked can see the recap.
  - [ ] The recap covers messages after that person's last message in the channel, or the last 24 hours if they haven't posted in that time.
  - [ ] It has 4 to 6 lines written in the TV narrator voice, ordered as they happened.
  - [ ] Every line ends with a jump link that opens the real message it describes.
  - [ ] A line that can't be tied to a real message is dropped, never shown.
  - [ ] Important stuff (announcements, dates, links from mods, scam warnings) is picked over small talk, but one funny moment is allowed.

### Reruns
- As a mod, I want repeat questions answered automatically with the answer that already exists, so I stop retyping it.
  - [ ] When someone posts a question that was already answered in the same channel, the bot replies to it with "📺 Rerun!", the date of the earlier answer, a jump link to that answer and a times asked count.
  - [ ] "wen airdrop", "when is the airdrop" and "airdrop date??" count as the same question.
  - [ ] A question that hasn't been answered before gets no reply.
  - [ ] If the bot isn't sure it's the same question, it stays quiet.
  - [ ] The reply doesn't ping anyone.

## States and Boundaries
- **First use / quiet channel**: nothing new since you left, so the recap says "Quiet episode. Nothing aired since you left. 📺"
- **Too much to read**: the recap reads at most the latest 500 messages and says so in the footer.
- **Missing permission**: if the bot can't read the channel, the reply names the exact permission it needs.
- **Something broke**: if the recap can't be made, the reply says it didn't work and to try again in a minute. No fake recap.
- **Same person asks again quickly**: no second rerun for the same person within 10 minutes.
- **Nasty content in history**: scam links and slurs are never repeated in a recap or rerun.
- **Who sees what**: recaps are private to the asker. Reruns are visible in the channel, like any reply.

## Product Decisions
- Discord only for now: Discord bots can read past messages, Telegram bots can't.
- Recap starts from your own last message: that's what "since you left" means in a chat.
- Every line must link to a real message: the learning goal is summaries that don't make things up.
- Reruns stay quiet when unsure: a wrong rerun is worse than no rerun.
- Reruns are funny, not mean: the counter is the joke, never the person.
- Assumption: reruns use answers from the same channel only, since that's where people asked.

## What We're Building
- The `/previously` command with private, linked, TV narrator recaps.
- Reruns for repeat questions in channels the bot can read.
- The empty, too much, missing permission and broken states above.
- A test server with a few hundred realistic messages to demo it.

## Deferred From the POC
- Trailer voice narration: nice for the demo, but it's audio work on top of the core.
- Telegram: needs a different way to see messages, since Telegram bots can't fetch history.
- Mods marking an official answer: needs a mod settings flow.
- Recap of the whole server: needs reading many channels at once and a much bigger budget.

## Possible Later Enhancements
- A weekly "season finale" recap posted in a channel.
- A "share this recap" button that posts it publicly.
- Per server tone settings (more serious for a support server).

## Non-Goals
- No web dashboard: Discord is the interface.
- No accounts or payments: nothing to sell in a proof of concept.
- No moderation actions: the bot never deletes, mutes or bans.
- No multi language support: the test server is English.

## Open Questions
- How is "same question" judged? Can wait for `4-spec`.
- Where does the times asked count come from (search history each time, or keep a count)? Can wait for `4-spec`.

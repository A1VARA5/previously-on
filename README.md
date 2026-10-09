# 📺 Previously On

[![tests](https://github.com/A1VARA5/previously-on/actions/workflows/test.yml/badge.svg)](https://github.com/A1VARA5/previously-on/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Node 22+](https://img.shields.io/badge/node-22%2B-339933?logo=node.js&logoColor=white)
![discord.js 14](https://img.shields.io/badge/discord.js-14-5865F2?logo=discord&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-Opus%205.5%20%2B%20Haiku%205.5-D97757)
[![Devpost: Build With AI Basics](https://img.shields.io/badge/Devpost-Build%20With%20AI%3A%20Basics-003E54?logo=devpost&logoColor=white)](https://learn-ai-basics.devpost.com/)

Your Discord server is a TV show. Catch up with a "previously on" recap, and stop answering the same question forever.

- **`/previously`**: you've been gone, there are hundreds of unread messages. Type it and get a private "📺 Previously on #channel" recap of what you missed since you last spoke there: 4 to 6 narrator lines, each with a "Jump to this message" link to the real message.
- **Reruns**: someone asks "wen airdrop??" for the 48th time. If the channel already answered it, the bot replies with "📺 Rerun!", a link to the answer and how many times it's been asked. New questions get nothing, and so does anything it isn't sure about.

**It never makes things up.** The model has to name the message every line came from, and plain code ([`src/grounding.js`](src/grounding.js)) throws away anything that doesn't point at a real message.

**It's cheap enough to leave on.** The chat is prompt cached, so a repeat recap costs about $0.009 instead of $0.057, and a rerun check on Haiku costs about $0.0001 once the earlier questions are cached (measured with real calls).

Built for the Devpost [Build With AI: Basics](https://learn-ai-basics.devpost.com/) hackathon with the Devpost Learn skill pack ([`skills-lock.json`](skills-lock.json)). The planning docs are in [`devpost/`](devpost/): [scope](devpost/scope.md), [PRD](devpost/prd.md), [spec](devpost/spec.md), [build checklist](devpost/checklist.md) and an [app map](devpost/app-map.html).

## Try it in 60 seconds (no Discord needed)

```bash
npm install
echo "ANTHROPIC_API_KEY=your-key" > .env
npm run recap:sample    # a recap of 180 messages of sample chat, with the source of every line
npm run reruns:sample   # 7 test questions: which ones are reruns and which answer they point at
npm test                # 13 unit tests, no API calls
```

## Where to look in the code

| What | Where |
|---|---|
| Bot entry, `/previously` and the rerun listener | [`src/index.js`](src/index.js) |
| Reading channel history, "since you left" | [`src/history.js`](src/history.js) |
| The recap prompt and Claude call (prompt cached) | [`src/recap.js`](src/recap.js) |
| Same question matching (Haiku, cached), cooldown | [`src/reruns.js`](src/reruns.js) |
| Grounding: what's real and what gets dropped | [`src/grounding.js`](src/grounding.js) |
| What counts as a question | [`src/questions.js`](src/questions.js) |
| How replies look | [`src/replies.js`](src/replies.js) |
| Models, prices, cost logging | [`src/claude.js`](src/claude.js) |

## Run it in your server

You need Node 22+, a Discord server you can test in, and an Anthropic API key.

1. Create an app at https://discord.com/developers/applications, add a bot, copy its token.
2. On the app's **Bot** page, switch on **Message Content Intent**.
3. Invite it with the `bot` and `applications.commands` scopes and these permissions: View Channel, Read Message History, Send Messages, Manage Webhooks (only for the sample chat).
4. `npm install`
5. Copy `.env.example` to `.env` and fill in `ANTHROPIC_API_KEY`, `DISCORD_TOKEN`, `DISCORD_APP_ID` (General Information page), `DISCORD_GUILD_ID` and `DISCORD_CHANNEL_ID` (turn on Developer Mode in Discord, then right click to copy IDs). Use a private test channel.
6. `npm run register` adds `/previously` to your server.
7. Optional: `npm run seed` posts about 180 messages of **made up sample chat** (a fake community called Nodeverse). `npm run seed -- 2` posts a fresh "episode 2" to catch up on after you've chatted in the channel yourself.
8. `npm start`, then type `/previously`.

## Cost

| Call | Model | First call | Repeat within 5 min (cached) |
|---|---|---|---|
| Recap of ~180 messages | Claude Opus 5.5 | ~$0.057 | ~$0.009 |
| Rerun check | Claude Haiku 5.5 | ~$0.0006 | ~$0.0001 |

Every call logs its tokens, cache writes, cache reads and cost.

## Limits

- Discord only. Telegram bots can't read past messages, so that needs a different approach.
- Reads the latest 500 messages per recap and 300 per rerun check. Nothing is stored.
- Grounding proves which message each recap line came from, not that the sentence describes it perfectly.
- The rerun cooldown lives in memory and resets when the bot restarts.

## Credits

Claude Opus 5.5 and Claude Haiku 5.5 (Anthropic), discord.js, zod, dotenv. Planned and built with the [Devpost Learn skill pack](https://github.com/challengepost/learn-ai-basics). Claude Code was the coding tool.

## License

[MIT](LICENSE)

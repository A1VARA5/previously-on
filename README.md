# 📺 Previously On

A Discord bot that remembers what your server said and tells it back like a TV show.

- **`/previously`**: you've been gone, there are hundreds of unread messages. Type it and get a private "previously on #channel" recap of what you missed, 4 to 6 narrator lines, each linking to the real message.
- **Reruns**: someone asks "wen airdrop??" for the 48th time. If the channel already answered it, the bot replies with "📺 Rerun!", a link to the answer and how many times it's been asked. New questions get nothing.

Every recap line and every rerun points at a real message. The model has to say which message each line comes from, and code throws away anything that doesn't match (`src/grounding.js`).

Built for the Devpost Build With AI: Basics hackathon. Planning docs are in [`devpost/`](devpost/).

## Setup

You need Node 22+, a Discord server you can test in, and an Anthropic API key.

1. Create an app at https://discord.com/developers/applications, add a bot, copy its token.
2. In the app's **Bot** page, switch on **Message Content Intent**.
3. Invite it with the `bot` and `applications.commands` scopes and these permissions: View Channel, Read Message History, Send Messages, Manage Webhooks (only needed for the sample chat).
4. `npm install`
5. Copy `.env.example` to `.env` and fill in:
   - `ANTHROPIC_API_KEY`
   - `DISCORD_TOKEN`, `DISCORD_APP_ID` (Application ID on the General Information page)
   - `DISCORD_GUILD_ID` (your test server) and `DISCORD_CHANNEL_ID` (the channel for the sample chat). Turn on Developer Mode in Discord, then right click to copy IDs.
6. `npm run register` adds `/previously` to your test server.
7. Optional: `npm run seed` fills the channel with about 180 messages of **made up sample chat** (a fake community called Nodeverse) so there's something to recap.
8. `npm start`

## Try it without Discord

- `npm run recap:sample` writes a recap of the sample chat in your terminal and shows which message each line came from.
- `npm run reruns:sample` checks which test questions count as reruns.
- `npm test` runs the unit tests (grounding, question spotting, history window, cooldown). No API calls.

## Cost

Recaps use Claude Opus 5.5, reruns use Claude Haiku 5.5. A recap of about 500 messages is roughly $0.07, a rerun check roughly $0.0005.

## Limits

- Discord only. Telegram bots can't read past messages, so that needs a different approach.
- Reads the latest 500 messages per recap and 300 per rerun check. Nothing is stored.
- The rerun cooldown lives in memory and resets when the bot restarts.

## License

MIT

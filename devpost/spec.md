---
doc: spec
status: approved
---

# Previously On: Technical Spec

## How This Works, In Plain Language
Previously On is one small Node program that stays connected to Discord, like a member who never logs off.

- When you type `/previously`, the bot asks Discord for the recent messages in that channel, finds where you last spoke, and sends the messages after that to Claude with one rule: write 4 to 6 TV narrator lines and say which message each line came from. The bot then checks every line against the real messages. A line pointing at a message that doesn't exist gets thrown away. What survives goes back to you as a private reply with jump links.
- When anyone posts something that looks like a question, the bot grabs the earlier questions in that channel and asks a small, cheap Claude model: "is this the same question as any of these, and which message answered it?" Again the bot checks the answer points at real messages. If it's a match, it replies with the rerun. If not, or if anything is unclear, it stays silent.

There's no database: Discord already keeps the history, so the bot reads it when needed. That keeps it to one process, one Discord token and one Claude key.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. Admin invites the bot → Discord gives it access to read messages and history in the test server.
2. User types `/previously` → Discord sends the command to the bot over its live connection → the bot replies "thinking" privately so Discord doesn't time out.
3. **History Reader** fetches up to 500 latest messages in the channel → finds the user's last message (or the 24 hour cutoff) → keeps only what came after.
4. **Recap Writer** sends those messages (id, author, time, text) to Claude → gets back JSON lines, each with a `message_id`.
5. **Grounding Check** drops any line whose `message_id` isn't in what we sent, and cleans out links and slurs.
6. **Discord Replies** edits the private reply into the "📺 Previously on #channel" embed with jump links.
7. Someone posts "wen airdrop??" → **Question Spotter** decides it looks like a question → **Rerun Matcher** gets the earlier questions plus the replies after them from History Reader → asks Claude Haiku for a match → **Grounding Check** confirms the ids → **Discord Replies** posts the rerun reply with no ping. No match → nothing happens.

## Stack
- **Node 22 + JavaScript (ES modules)**. Already installed (v22.15.0) and what the learner used for bots before. https://nodejs.org/docs/latest-v22.x/api/
- **discord.js v14**: slash commands, the live connection (gateway), fetching history, embeds. Chosen because reruns need to see new messages as they happen, which needs the gateway, not the HTTP only style. https://discord.js.org/docs
- **@anthropic-ai/sdk**: official Claude SDK. https://docs.claude.com/en/api/client-sdks
  - Recaps: `claude-opus-5-5` (current default Claude model) at `low` effort with structured JSON output, since writing a funny but accurate recap is the hard part.
  - Rerun matching: `claude-haiku-5-5`, a cheap judge model, since it runs on every question.
- **dotenv** for loading `.env`. https://github.com/motdotla/dotenv
- **node:test** (built in) for the grounding check and question spotter tests.

## Where It Runs and How Someone Tries It
- Runs locally on the learner's PC as `node src/index.js` (or `npm start`). Needs `.env` with `DISCORD_TOKEN`, `DISCORD_APP_ID`, `ANTHROPIC_API_KEY`.
- One time: `npm run register` registers `/previously` in the test server (`DISCORD_GUILD_ID` in `.env`), and `npm run seed` fills the test channel with sample chat (clearly labelled sample data).
- Demo recording: open the test server in Discord, run `/previously`, then post a repeat question and a new question.
- Submission needs a short demo video and a public GitHub repository. Deployment is optional and not planned.

## Look and Feel
From `prd.md > Look and Feel`.
- Recap embed: title "📺 Previously on #channel", colour `#2B2D31` (switched off CRT, close to Discord dark), description line "Since you left <relative time>", then one narrator sentence per line with a jump link, footer "Read N messages".
- Narrator voice set in the recap prompt: short dramatic sentences, light humour, never mean, no hashtags.
- Rerun reply: one plain line, "📺 Rerun! This episode already aired on <date>, here's the answer 👉 <link>. Times asked: N 💀", sent with mentions disabled.

## Components

### Bot Entry
Starts the Discord client with the intents Guilds, GuildMessages and MessageContent, and routes events: slash commands to the Recap Command, new messages to the Rerun Listener.
PRD ref: `prd.md > Screens and Layout`.

### Recap Command
Handles `/previously`: defers the reply privately, calls History Reader, Recap Writer, Grounding Check, then edits the reply. Shows the quiet, missing permission and broken states.
PRD ref: `prd.md > Features and Behavior > The recap (/previously)`, `prd.md > States and Boundaries`.

### History Reader
Fetches the latest messages in a channel in pages of 100, up to 500. Returns plain objects `{id, author, authorId, isBot, time, text, replyTo}`. Also finds a user's last message.
PRD ref: `prd.md > The Core Journey`.

### Recap Writer
Builds the prompt from the messages and asks Claude for `{"lines": [{"text", "message_id"}]}` using structured output. Messages go in as data inside clear tags, with an instruction that their content is never instructions.
PRD ref: `prd.md > Features and Behavior > The recap (/previously)`.

### Question Spotter
Pure function: is this message a question worth checking? Ends with "?", or starts with a question word (who, what, when, wen, where, how, is, are, can, does, why), has at least 3 words, isn't from a bot.
PRD ref: `prd.md > Features and Behavior > Reruns`.

### Rerun Matcher
Collects earlier questions in the channel (via Question Spotter) and, for each, the following messages that could be its answer (a direct reply, or the next few messages by someone else). Asks Haiku for `{"match": bool, "earlier_question_ids": [], "answer_message_id": string|null, "confident": bool}`. Times asked = matched earlier questions + 1.
PRD ref: `prd.md > Features and Behavior > Reruns`.

### Grounding Check
Pure functions. Keeps only recap lines whose `message_id` is in the input set, caps at 6 lines, strips URLs and blocked words from narrator text. For reruns, rejects any match whose ids aren't real or whose `confident` is false.
PRD ref: `prd.md > Product Decisions` ("every line must link to a real message", "stay quiet when unsure").

### Discord Replies
Builds the recap embed and the rerun text, jump links as `https://discord.com/channels/<guild>/<channel>/<message>`, and always sends with `allowedMentions: { parse: [] }`.
PRD ref: `prd.md > Look and Feel`.

### Rerun Cooldown
In memory map of user id to last rerun time, so nobody gets a second rerun within 10 minutes. Resets when the bot restarts, which is fine for a proof of concept.
PRD ref: `prd.md > States and Boundaries`.

### Seeder (sample data)
A script that posts a few hundred realistic, clearly fake community messages into the test channel through a channel webhook, so each message shows a different username. Includes mod answers to a few common questions so reruns have something to find.
PRD ref: `prd.md > What We're Building`.

## Data Model
- Nothing is stored on disk. History lives in Discord and is read on demand.
- The only state is the Rerun Cooldown map in memory.
- `.env` holds secrets and is git ignored.

## File Structure
```
learn-ai-basics/
├── src/
│   ├── index.js            # Bot Entry: client, intents, event routing
│   ├── recap.js            # Recap Command + Recap Writer
│   ├── reruns.js           # Rerun Listener, Rerun Matcher, cooldown
│   ├── history.js          # History Reader
│   ├── grounding.js        # Grounding Check (pure, tested)
│   ├── questions.js        # Question Spotter (pure, tested)
│   ├── replies.js          # embeds, rerun text, jump links
│   └── claude.js           # shared Anthropic client + model names
├── scripts/
│   ├── register.js         # registers /previously in the test server
│   └── seed.js             # posts sample chat via webhook
├── test/
│   ├── grounding.test.js
│   └── questions.test.js
├── .env.example            # names of the env vars, no values
├── package.json
├── README.md               # setup and run instructions
└── devpost/                # planning docs
```

## External Services and Dependencies
- **Discord API** via discord.js. Needs an application with a bot token, the Message Content privileged intent switched on in the Developer Portal, and the bot invited with View Channel, Read Message History, Send Messages and Manage Webhooks (seeder only). History fetch is 100 messages per call, so 500 messages is 5 calls; discord.js handles rate limits. Free. https://discord.com/developers/docs/resources/message#get-channel-messages
- **Claude API** via @anthropic-ai/sdk, `messages.create` with `output_config.format` for JSON. https://docs.claude.com/en/api/messages
  - Recap (Opus 5.5, $4 in / $20 out per million tokens): about 500 messages is roughly 15k input tokens plus about 500 output, so about $0.07 per recap.
  - Rerun check (Haiku 5.5, $0.10 / $0.50 per million): about 4k tokens, roughly $0.0005 per question.
  - A full day of demo testing (50 recaps, 300 question checks) is about $3.65. Cost is stated to the learner before any bulk run.

## Important Failure Modes
- **Claude errors or is slow** → the recap reply says "Couldn't make the recap this time, try again in a minute." Reruns stay silent. Nothing made up is shown.
- **Message Content intent is off** → messages arrive with empty text; the bot logs a clear warning at startup and the recap says the intent is missing.
- **The model points at a message that doesn't exist** → Grounding Check drops that line. If fewer than 2 lines survive, the recap says it couldn't make a reliable recap.

## What Was Simplified and Why
- **Read history on demand** instead of a database of every message: fine for one test server and 500 messages. The fuller version would store messages as they arrive for big servers and long absences.
- **A cheap model judges "same question"** instead of embeddings and a vector search: no extra service, and it handles slang like "wen". The fuller version would use embeddings to find candidates first so it scales to thousands of past questions.
- **Cooldown in memory** instead of stored: it resets on restart, which doesn't matter for a demo.
- **Seeded sample chat** instead of a real server: the demo needs a predictable story. It's labelled as sample data in the README and video.

## Decisions and Open Issues
- Discord only, local run, no database: learner choices from the scope and PRD (Telegram can't read history).
- Opus 5.5 for recaps, Haiku 5.5 for rerun judging: recommendation accepted because recaps are the hard, rare call and question checks are frequent and simple.
- **The learner's uncertainty:** "how 'is this the same question' matching actually works, because a keyword search won't get it." Clarified like this: we let a small model compare meaning and return ids, then code verifies those ids exist, and the bot only acts when the model says it's confident. During the build we check it with a small test: "wen airdrop", "when is the airdrop", "airdrop date??" must match the earlier "When does the airdrop start?", and "how do I stake" must not.
- Also from the learning goal: grounding. Every recap line carries a `message_id`, and code (not the model) decides what's real. Tested in `test/grounding.test.js`.
- Open: `prd.md > Open Questions` are answered above (Rerun Matcher judges sameness; times asked is counted from history each time).

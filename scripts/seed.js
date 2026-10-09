// Posts the SAMPLE chat into the test channel through a webhook, one username per sample author.
// Clearly fake data for the demo. spec.md > Seeder (sample data)
import "dotenv/config";
import { REST, Routes } from "discord.js";
import { SAMPLE_MESSAGES } from "../data/sample-chat.js";
import { SAMPLE_MESSAGES_2 } from "../data/sample-chat-2.js";

// `npm run seed` posts episode 1, `npm run seed -- 2` posts episode 2 (new chat to catch up on).
const episode = process.argv[2] === "2" ? 2 : 1;
const toPost = episode === 2 ? SAMPLE_MESSAGES_2.map(([author, text]) => ({ author, text })) : SAMPLE_MESSAGES;

const { DISCORD_TOKEN, DISCORD_CHANNEL_ID } = process.env;
if (!DISCORD_TOKEN || !DISCORD_CHANNEL_ID) {
  console.error("Need DISCORD_TOKEN and DISCORD_CHANNEL_ID in .env");
  process.exit(1);
}

const rest = new REST().setToken(DISCORD_TOKEN);
const hook = await rest.post(Routes.channelWebhooks(DISCORD_CHANNEL_ID), { body: { name: "Previously On sample chat" } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  let n = 0;
  for (const m of toPost) {
    await rest.post(Routes.webhook(hook.id, hook.token), {
      body: { content: m.text, username: m.author, allowed_mentions: { parse: [] } },
      auth: false,
    });
    if (++n % 20 === 0) console.log(`posted ${n}/${toPost.length}`);
    await sleep(450); // stay under the webhook rate limit
  }
  console.log(`Done: episode ${episode}, ${n} sample messages posted.`);
} finally {
  await rest.delete(Routes.webhook(hook.id)).catch((e) => console.error("couldn't delete webhook:", e.message));
}

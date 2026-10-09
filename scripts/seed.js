// Posts the SAMPLE chat into the test channel through a webhook, one username per sample author.
// Clearly fake data for the demo. spec.md > Seeder (sample data)
import "dotenv/config";
import { REST, Routes } from "discord.js";
import { SAMPLE_MESSAGES } from "../data/sample-chat.js";

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
  for (const m of SAMPLE_MESSAGES) {
    await rest.post(Routes.webhook(hook.id, hook.token), {
      body: { content: m.text, username: m.author, allowed_mentions: { parse: [] } },
      auth: false,
    });
    if (++n % 20 === 0) console.log(`posted ${n}/${SAMPLE_MESSAGES.length}`);
    await sleep(450); // stay under the webhook rate limit
  }
  console.log(`Done: ${n} sample messages posted.`);
} finally {
  await rest.delete(Routes.webhook(hook.id)).catch((e) => console.error("couldn't delete webhook:", e.message));
}

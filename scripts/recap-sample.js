// Prints a recap of the SAMPLE chat, so the recap can be tried without Discord.
import "dotenv/config";
import { SAMPLE_CHANNEL, SAMPLE_MESSAGES } from "../data/sample-chat.js";
import { writeRecap } from "../src/recap.js";
import { RECAP_MODEL, usageLine } from "../src/claude.js";

const byId = new Map(SAMPLE_MESSAGES.map((m) => [m.id, m]));
const recap = await writeRecap({ channelName: SAMPLE_CHANNEL, messages: SAMPLE_MESSAGES });

console.log(`\n📺 Previously on #${SAMPLE_CHANNEL}  (read ${SAMPLE_MESSAGES.length} sample messages)\n`);
for (const line of recap.lines) {
  const src = byId.get(line.messageId);
  console.log(`• ${line.text}`);
  console.log(`    ↳ ${line.messageId} ${src.author}: "${src.text.slice(0, 70)}"`);
}
console.log(`\nlines kept: ${recap.lines.length}, dropped: ${recap.dropped}, reliable: ${recap.reliable}`);
console.log(`tokens: ${usageLine(RECAP_MODEL, recap.usage)}`);

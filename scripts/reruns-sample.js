// Checks the rerun matcher against the SAMPLE chat (the spec's "same question" investigation).
import "dotenv/config";
import { SAMPLE_MESSAGES } from "../data/sample-chat.js";
import { findRerun } from "../src/reruns.js";
import { RERUN_MODEL, costOf } from "../src/claude.js";

const later = new Date(Date.parse(SAMPLE_MESSAGES.at(-1).time) + 60_000).toISOString();
const cases = [
  ["wen airdrop", true],
  ["when is the airdrop", true],
  ["airdrop date??", true],
  ["how do I stake", true],
  ["do I have to update my node for testnet?", true],
  ["what time does testnet go live?", false],
  ["can I run a node on a raspberry pi?", false],
];

let pass = 0;
let cost = 0;
for (const [text, shouldMatch] of cases) {
  const msg = { id: "1558109808152805449", author: "tester", authorId: "tester", text, time: later, isBot: false, replyTo: null };
  const r = await findRerun(SAMPLE_MESSAGES, msg);
  const ok = Boolean(r) === shouldMatch;
  pass += ok ? 1 : 0;
  if (r?.usage) cost += costOf(RERUN_MODEL, r.usage);
  console.log(`${ok ? "PASS" : "FAIL"}  "${text}" -> ${r ? `rerun of ${r.earlierQuestionIds.join(",")}, answer ${r.answerMessageId} (${r.answer.author}: "${r.answer.text.slice(0, 50)}"), times asked ${r.timesAsked}` : "no rerun"}`);
}
console.log(`\n${pass}/${cases.length} as expected. Calls that matched cost about $${cost.toFixed(4)}`);
process.exitCode = pass === cases.length ? 0 : 1;

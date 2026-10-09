import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCandidates, createCooldown } from "../src/reruns.js";

const t = (min) => new Date(Date.UTC(2026, 9, 14, 10, min)).toISOString();
const history = [
  { id: "q1", author: "ollie", authorId: "1", text: "When does the airdrop start?", time: t(0), isBot: false, replyTo: null },
  { id: "a1", author: "kasia_mod", authorId: "2", text: "Snapshot 31 Oct, claims 7 Nov.", time: t(1), isBot: false, replyTo: "q1" },
  { id: "x1", author: "ollie", authorId: "1", text: "thanks", time: t(2), isBot: false, replyTo: null },
  { id: "new", author: "ser", authorId: "3", text: "wen airdrop", time: t(5), isBot: false, replyTo: null },
];

test("earlier questions come with their replies, never the asker's own messages", () => {
  const c = buildCandidates(history, history[3]);
  assert.equal(c.length, 1);
  assert.equal(c[0].question.id, "q1");
  assert.deepEqual(c[0].answers.map((a) => a.id), ["a1"]);
});

test("the new question is never its own candidate", () => {
  const c = buildCandidates(history, history[3]);
  assert.ok(c.every((x) => x.question.id !== "new"));
});

test("cooldown blocks a second rerun for 10 minutes", () => {
  let clock = 0;
  const cd = createCooldown(10 * 60 * 1000, () => clock);
  assert.equal(cd.allow("u"), true);
  cd.mark("u");
  clock = 5 * 60 * 1000;
  assert.equal(cd.allow("u"), false);
  assert.equal(cd.allow("someone else"), true);
  clock = 10 * 60 * 1000;
  assert.equal(cd.allow("u"), true);
});

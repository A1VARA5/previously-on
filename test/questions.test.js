import { test } from "node:test";
import assert from "node:assert/strict";
import { looksLikeQuestion } from "../src/questions.js";

const q = (text, isBot = false) => looksLikeQuestion({ text, isBot });

test("spots the classics", () => {
  assert.equal(q("wen airdrop"), true);
  assert.equal(q("airdrop date??"), true);
  assert.equal(q("When does the airdrop start?"), true);
  assert.equal(q("how do I stake my tokens"), true);
});

test("ignores chat that isn't a question", () => {
  assert.equal(q("gm"), false);
  assert.equal(q("lfg"), false);
  assert.equal(q("the new app update is clean ngl"), false);
  assert.equal(q("?"), false);
});

test("ignores bots", () => {
  assert.equal(q("when is the airdrop?", true), false);
});

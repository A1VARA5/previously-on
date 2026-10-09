import { test } from "node:test";
import assert from "node:assert/strict";
import { groundRecap, groundRerun, cleanText } from "../src/grounding.js";

const msgs = [
  { id: "a", text: "one" },
  { id: "b", text: "two" },
  { id: "c", text: "three" },
];

test("drops recap lines that point at messages that don't exist", () => {
  const r = groundRecap(
    [
      { text: "real", message_id: "b" },
      { text: "made up", message_id: "zzz" },
      { text: "no id" },
    ],
    msgs,
  );
  assert.deepEqual(r.lines, [{ text: "real", messageId: "b" }]);
  assert.equal(r.dropped, 2);
  assert.equal(r.reliable, false);
});

test("keeps chat order, removes duplicates and caps at 6 lines", () => {
  const many = Array.from({ length: 10 }, (_, i) => ({ id: `m${i}`, text: "x" }));
  const lines = [...many].reverse().map((m) => ({ text: `line ${m.id}`, message_id: m.id }));
  lines.push({ text: "dupe", message_id: "m3" });
  const r = groundRecap(lines, many);
  assert.equal(r.lines.length, 6);
  assert.deepEqual(r.lines.map((l) => l.messageId), ["m0", "m1", "m2", "m3", "m4", "m5"]);
  assert.equal(r.reliable, true);
});

test("strips links and slurs from narrator text", () => {
  assert.equal(cleanText("go to scam-verify.example now"), "go to [link removed] now");
  assert.equal(cleanText("see https://evil.com/x ok"), "see [link removed] ok");
  assert.equal(cleanText("you retard"), "you [removed]");
  assert.equal(cleanText("Testnet goes live Thursday."), "Testnet goes live Thursday.");
});

test("rerun needs confidence and real ids", () => {
  const ok = { match: true, confident: true, earlier_question_ids: ["q1", "q2"], answer_message_id: "a1" };
  assert.deepEqual(groundRerun(ok, ["q1", "q2"], ["a1"]), {
    earlierQuestionIds: ["q1", "q2"],
    answerMessageId: "a1",
    timesAsked: 3,
  });
  assert.equal(groundRerun({ ...ok, confident: false }, ["q1", "q2"], ["a1"]), null);
  assert.equal(groundRerun({ ...ok, answer_message_id: "nope" }, ["q1", "q2"], ["a1"]), null);
  assert.equal(groundRerun({ ...ok, earlier_question_ids: ["ghost"] }, ["q1"], ["a1"]), null);
  assert.equal(groundRerun({ ...ok, match: false }, ["q1", "q2"], ["a1"]), null);
});

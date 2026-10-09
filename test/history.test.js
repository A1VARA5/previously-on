import { test } from "node:test";
import assert from "node:assert/strict";
import { sinceYouLeft } from "../src/history.js";

const now = Date.UTC(2026, 9, 14, 12);
const h = (hoursAgo, authorId, text = "hi", isBot = false) => ({
  id: `${hoursAgo}-${authorId}`,
  authorId,
  text,
  isBot,
  time: new Date(now - hoursAgo * 3600_000).toISOString(),
});

test("starts after your own last message", () => {
  const msgs = [h(10, "a"), h(8, "me"), h(5, "b"), h(2, "c")];
  const r = sinceYouLeft(msgs, "me", now);
  assert.deepEqual(r.messages.map((m) => m.id), ["5-b", "2-c"]);
});

test("falls back to the last 24 hours when you haven't posted lately", () => {
  const msgs = [h(30, "me"), h(26, "a"), h(20, "b"), h(1, "c")];
  const r = sinceYouLeft(msgs, "me", now);
  assert.deepEqual(r.messages.map((m) => m.id), ["20-b", "1-c"]);
});

test("nothing new means a quiet episode, and bots are skipped", () => {
  assert.equal(sinceYouLeft([h(3, "a"), h(1, "me")], "me", now).messages.length, 0);
  assert.equal(sinceYouLeft([h(1, "me"), h(0.5, "bot", "beep", true)], "me", now).messages.length, 0);
});

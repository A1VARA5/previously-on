// History Reader: Discord already keeps the history, we just read it.
// spec.md > History Reader

export const MAX_MESSAGES = 500;
const DAY_MS = 24 * 60 * 60 * 1000;

export function toPlain(msg) {
  return {
    id: msg.id,
    author: msg.member?.displayName ?? msg.author?.username ?? "someone",
    authorId: msg.author?.id ?? null,
    // Webhook posts (like the seeded sample chat) count as people, real bots don't.
    isBot: Boolean(msg.author?.bot && !msg.webhookId),
    time: msg.createdAt.toISOString(),
    text: msg.content ?? "",
    replyTo: msg.reference?.messageId ?? null,
    url: msg.url,
  };
}

/** Latest messages in a channel, oldest first. Pages of 100, up to `limit`. */
export async function fetchRecent(channel, { limit = MAX_MESSAGES, before } = {}) {
  const out = [];
  let cursor = before;
  while (out.length < limit) {
    const page = await channel.messages.fetch({ limit: Math.min(100, limit - out.length), before: cursor });
    if (page.size === 0) break;
    for (const m of page.values()) out.push(m);
    cursor = page.last().id;
    if (page.size < 100) break;
  }
  return out.reverse().map(toPlain);
}

/**
 * Everything after the user's last message, or the last 24 hours if they
 * haven't posted in that time. prd.md > Features and Behavior > The recap
 */
export function sinceYouLeft(messages, userId, now = Date.now()) {
  const dayAgo = now - DAY_MS;
  let startIdx = messages.findIndex((m) => Date.parse(m.time) >= dayAgo);
  if (startIdx === -1) startIdx = messages.length;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].authorId === userId) {
      if (Date.parse(messages[i].time) >= dayAgo) startIdx = i + 1;
      break;
    }
  }
  const since = startIdx < messages.length ? messages[startIdx - 1]?.time ?? new Date(dayAgo).toISOString() : null;
  return { messages: messages.slice(startIdx).filter((m) => !m.isBot && m.text.trim()), since };
}

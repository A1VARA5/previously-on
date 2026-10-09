// Grounding Check: code, not the model, decides what's real.
// spec.md > Grounding Check

export const MAX_RECAP_LINES = 6;
export const MIN_RECAP_LINES = 2;

const URL_RE = /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|xyz|example|app|gg|me|co)\b\S*/gi;
// Keep this short and obvious; it's a safety net, not moderation.
const BLOCKED_WORDS = ["nigger", "faggot", "retard", "kys"];

export function cleanText(text) {
  let out = String(text ?? "").replace(URL_RE, "[link removed]");
  for (const w of BLOCKED_WORDS) {
    out = out.replace(new RegExp(`\\b${w}\\w*`, "gi"), "[removed]");
  }
  return out.replace(/\s+/g, " ").trim();
}

/**
 * Keep only recap lines that point at a message we actually sent the model.
 * Returns lines in chat order, max 6, plus how many were dropped.
 */
export function groundRecap(lines, messages) {
  const byId = new Map(messages.map((m, i) => [m.id, { ...m, order: i }]));
  const seen = new Set();
  const kept = [];
  let dropped = 0;
  for (const line of Array.isArray(lines) ? lines : []) {
    const id = line?.message_id;
    const text = cleanText(line?.text);
    if (!id || !byId.has(id) || seen.has(id) || !text) {
      dropped++;
      continue;
    }
    seen.add(id);
    kept.push({ text, messageId: id, order: byId.get(id).order });
  }
  kept.sort((a, b) => a.order - b.order);
  const extra = Math.max(0, kept.length - MAX_RECAP_LINES);
  return {
    lines: kept.slice(0, MAX_RECAP_LINES).map(({ text, messageId }) => ({ text, messageId })),
    dropped: dropped + extra,
    reliable: Math.min(kept.length, MAX_RECAP_LINES) >= MIN_RECAP_LINES,
  };
}

/**
 * A rerun only counts if the model is confident and every id it gave is real.
 */
export function groundRerun(result, candidateQuestionIds, candidateAnswerIds) {
  if (!result || result.match !== true || result.confident !== true) return null;
  const qs = new Set(candidateQuestionIds);
  const as = new Set(candidateAnswerIds);
  const earlier = [...new Set(result.earlier_question_ids ?? [])];
  if (earlier.length === 0 || !earlier.every((id) => qs.has(id))) return null;
  if (!result.answer_message_id || !as.has(result.answer_message_id)) return null;
  return { earlierQuestionIds: earlier, answerMessageId: result.answer_message_id, timesAsked: earlier.length + 1 };
}

// Question Spotter: is this worth checking for a rerun?
// spec.md > Question Spotter
const QUESTION_WORDS = /^(who|what|when|wen|where|how|why|is|are|can|does|do|did|will|should|which|anyone)\b/i;

export function looksLikeQuestion(msg) {
  if (!msg || msg.isBot) return false;
  const text = String(msg.text ?? "").trim();
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 2) return false;
  return /\?\s*$/.test(text) || (QUESTION_WORDS.test(text) && words.length >= 2);
}

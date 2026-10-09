import Anthropic from "@anthropic-ai/sdk";

// spec.md > Stack: Opus writes recaps (rare, hard), Haiku judges reruns (frequent, simple).
export const RECAP_MODEL = "claude-opus-5-5";
export const RERUN_MODEL = "claude-haiku-5-5";

let client;
export function claude() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is missing from .env");
  }
  client ??= new Anthropic({ maxRetries: 2, timeout: 60_000 });
  return client;
}

// $ per million tokens: [input, output, cache write (5 min), cache read]
const PRICES = {
  [RECAP_MODEL]: [4, 20, 5, 0.2],
  [RERUN_MODEL]: [0.1, 0.5, 0.125, 0.01],
};

/** Dollar cost of one response, cache writes and reads included. */
export function costOf(model, usage) {
  const [inp, out, write, read] = PRICES[model];
  return (
    (usage.input_tokens * inp +
      usage.output_tokens * out +
      (usage.cache_creation_input_tokens ?? 0) * write +
      (usage.cache_read_input_tokens ?? 0) * read) /
    1e6
  );
}

export function usageLine(model, usage) {
  return `in ${usage.input_tokens}, cache write ${usage.cache_creation_input_tokens ?? 0}, cache read ${usage.cache_read_input_tokens ?? 0}, out ${usage.output_tokens} (~$${costOf(model, usage).toFixed(4)})`;
}

// Messages go to the model as data, one JSON object per line.
export function formatMessages(messages) {
  return messages
    .map((m) =>
      JSON.stringify({
        id: m.id,
        author: m.author,
        time: m.time,
        reply_to: m.replyTo ?? undefined,
        text: m.text.slice(0, 600),
      }),
    )
    .join("\n");
}

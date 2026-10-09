// Discord Replies: how the show looks on screen.
// spec.md > Discord Replies, spec.md > Look and Feel
import { EmbedBuilder } from "discord.js";

export const CRT_COLOUR = 0x2b2d31;
export const NO_PINGS = { parse: [] };

export function jumpLink(guildId, channelId, messageId) {
  return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
}

export function recapEmbed({ channelName, lines, linkFor, since, readCount }) {
  const sinceUnix = since ? Math.floor(Date.parse(since) / 1000) : null;
  const body = lines.map((l) => `${l.text}\n[Jump to this message](${linkFor(l.messageId)})`).join("\n\n");
  return new EmbedBuilder()
    .setColor(CRT_COLOUR)
    .setTitle(`📺 Previously on #${channelName}`)
    .setDescription(`${sinceUnix ? `*Since you left <t:${sinceUnix}:R>*\n\n` : ""}${body}`)
    .setFooter({ text: `Read ${readCount} messages` });
}

export function rerunText({ answeredAt, answerUrl, timesAsked }) {
  const date = new Date(answeredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `📺 Rerun! This episode already aired on ${date}, here's the answer 👉 ${answerUrl}. Times asked: ${timesAsked} 💀`;
}

export const STATE = {
  quiet: "📺 Quiet episode. Nothing aired since you left.",
  broken: "📺 Couldn't make the recap this time. Try again in a minute.",
  unreliable: "📺 Couldn't make a recap I'd trust from these messages. Try again in a minute.",
  noAccess: (missing) => `📺 I can't read this channel yet. Ask an admin to give me: ${missing.join(", ")}.`,
  noContent:
    "📺 I can see the messages but not their text. An admin needs to switch on the Message Content intent for this bot in the Discord Developer Portal.",
};

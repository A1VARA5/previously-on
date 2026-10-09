// Bot Entry: one process that stays connected to Discord.
// spec.md > Bot Entry, spec.md > Recap Command
import "dotenv/config";
import { Client, Events, GatewayIntentBits, MessageFlags, PermissionFlagsBits } from "discord.js";
import { fetchRecent, sinceYouLeft, toPlain } from "./history.js";
import { writeRecap } from "./recap.js";
import { RECAP_MODEL, RERUN_MODEL, usageLine } from "./claude.js";
import { findRerun, createCooldown } from "./reruns.js";
import { looksLikeQuestion } from "./questions.js";
import { recapEmbed, rerunText, jumpLink, NO_PINGS, STATE } from "./replies.js";

for (const key of ["DISCORD_TOKEN", "ANTHROPIC_API_KEY"]) {
  if (!process.env[key]) {
    console.error(`Missing ${key} in .env. See README.md > Setup.`);
    process.exit(1);
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});
const cooldown = createCooldown();

const NEEDED = [
  [PermissionFlagsBits.ViewChannel, "View Channel"],
  [PermissionFlagsBits.ReadMessageHistory, "Read Message History"],
  [PermissionFlagsBits.SendMessages, "Send Messages"],
];
const missingPerms = (channel) => {
  const perms = channel.permissionsFor(client.user);
  return NEEDED.filter(([flag]) => !perms?.has(flag)).map(([, name]) => name);
};

client.once(Events.ClientReady, (c) => {
  console.log(`📺 Previously On is live as ${c.user.tag} in ${c.guilds.cache.size} server(s).`);
  console.log("If recaps come back empty, switch on the Message Content intent in the Developer Portal.");
});

// /previously: the recap. prd.md > Features and Behavior > The recap (/previously)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== "previously") return;
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const channel = interaction.channel;
  try {
    const missing = missingPerms(channel);
    if (missing.length) return void (await interaction.editReply(STATE.noAccess(missing)));

    const history = await fetchRecent(channel);
    if (history.length && history.every((m) => m.isBot || !m.text.trim()) && history.some((m) => !m.isBot)) {
      return void (await interaction.editReply(STATE.noContent));
    }
    const { messages, since } = sinceYouLeft(history, interaction.user.id);
    if (messages.length === 0) return void (await interaction.editReply(STATE.quiet));

    const recap = await writeRecap({ channelName: channel.name, messages });
    if (!recap.reliable) return void (await interaction.editReply(STATE.unreliable));

    const embed = recapEmbed({
      channelName: channel.name,
      lines: recap.lines,
      linkFor: (id) => jumpLink(interaction.guildId, channel.id, id),
      since,
      readCount: messages.length,
    });
    await interaction.editReply({ embeds: [embed], allowedMentions: NO_PINGS });
    console.log(`recap for ${interaction.user.tag}: ${recap.lines.length} lines, ${recap.dropped} dropped, ${usageLine(RECAP_MODEL, recap.usage)}`);
  } catch (err) {
    console.error("recap failed:", err?.status ?? "", err?.message ?? err);
    await interaction.editReply(STATE.broken).catch(() => {});
  }
});

// Reruns. prd.md > Features and Behavior > Reruns
client.on(Events.MessageCreate, async (message) => {
  if (!message.inGuild() || message.author.bot || message.webhookId) return;
  const msg = toPlain(message);
  if (!looksLikeQuestion(msg) || !cooldown.allow(message.author.id)) return;
  if (missingPerms(message.channel).length) return;
  try {
    const history = await fetchRecent(message.channel, { limit: 300, before: message.id });
    const rerun = await findRerun([...history, msg], msg);
    if (!rerun) return;
    cooldown.mark(message.author.id);
    await message.reply({
      content: rerunText({ answeredAt: rerun.answer.time, answerUrl: rerun.answer.url, timesAsked: rerun.timesAsked }),
      allowedMentions: NO_PINGS,
    });
    console.log(`rerun for "${msg.text}" -> ${rerun.answerMessageId} (asked ${rerun.timesAsked}x), ${usageLine(RERUN_MODEL, rerun.usage)}`);
  } catch (err) {
    // Reruns are a nice to have: when unsure or broken, stay quiet but leave a trace for the operator.
    console.error("rerun check failed:", err?.status ?? "", err?.message ?? err);
  }
});

client.login(process.env.DISCORD_TOKEN);

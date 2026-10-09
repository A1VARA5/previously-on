// Registers /previously in the test server (guild commands update instantly).
import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const { DISCORD_TOKEN, DISCORD_APP_ID, DISCORD_GUILD_ID } = process.env;
if (!DISCORD_TOKEN || !DISCORD_APP_ID || !DISCORD_GUILD_ID) {
  console.error("Need DISCORD_TOKEN, DISCORD_APP_ID and DISCORD_GUILD_ID in .env");
  process.exit(1);
}

const commands = [
  new SlashCommandBuilder().setName("previously").setDescription("📺 Catch up: a TV style recap of what you missed in this channel"),
].map((c) => c.toJSON());

const rest = new REST().setToken(DISCORD_TOKEN);
const result = await rest.put(Routes.applicationGuildCommands(DISCORD_APP_ID, DISCORD_GUILD_ID), { body: commands });
console.log(`Registered ${result.length} command(s): ${result.map((c) => "/" + c.name).join(", ")}`);

import { REST, Routes } from "discord.js";
import { loadConfig } from "./config.js";
import { buildSlashCommands } from "./discord/commands.js";

const config = loadConfig();
const rest = new REST({ version: "10" }).setToken(config.discordToken);
const commands = buildSlashCommands().map((command) => command.toJSON());

await rest.put(Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId), {
  body: commands
});

console.log(`Registered ${commands.length} Arydia slash commands.`);

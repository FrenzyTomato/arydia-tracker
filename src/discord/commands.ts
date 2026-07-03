import { SlashCommandBuilder } from "discord.js";

export function buildSlashCommands(): SlashCommandBuilder[] {
  return [
    new SlashCommandBuilder()
      .setName("create")
      .setDescription("Create and bind an Arydia character to yourself."),
    new SlashCommandBuilder()
      .setName("delete")
      .setDescription("Delete your bound Arydia character after confirmation."),
    new SlashCommandBuilder()
      .setName("levelup")
      .setDescription("Level up your bound Arydia character."),
    new SlashCommandBuilder()
      .setName("stats")
      .setDescription("Show your current Arydia character stats."),
    new SlashCommandBuilder()
      .setName("help")
      .setDescription("Show help for available Arydia bot commands.")
  ];
}

import { DatabaseSync } from "node:sqlite";
import { Client, Events, GatewayIntentBits } from "discord.js";
import { loadConfig } from "./config.js";
import { loadArydiaData } from "./data/arydiaData.js";
import { CharacterRepository } from "./db/characterRepository.js";
import { handleInteraction } from "./discord/interactionHandler.js";

const config = loadConfig();
const data = loadArydiaData();
const database = new DatabaseSync(config.databasePath);
const repository = new CharacterRepository(database);
repository.initialize();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Arydia bot logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await handleInteraction(interaction, repository, data);
  } catch (error) {
    console.error(error);
    if (interaction.isRepliable()) {
      const content = "Something went wrong while handling that command.";
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content, flags: 64 });
      } else {
        await interaction.reply({ content, flags: 64 });
      }
    }
  }
});

await client.login(config.discordToken);

import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  Interaction,
  MessageFlags,
  StringSelectMenuInteraction
} from "discord.js";
import { ArydiaData, AttributeKey, STAT_KEYS, StatKey, ATTRIBUTES } from "../domain/types.js";
import {
  buildInitialCharacter,
  formatHelpText,
  formatCharacterSheet,
  formatNextLevelPreview,
  formatStatsPrompt,
  getLevelUpPrompt,
  levelUpCharacter
} from "../domain/characterService.js";
import { CharacterRepository } from "../db/characterRepository.js";
import {
  buildAttributeButtons,
  buildCreateConfirmation,
  buildCreateSelectionRow,
  buildDeleteConfirmation,
  buildStatsPreviewConfirmation,
  buildStatButtons
} from "./components.js";

const pendingLevelUps = new Map<string, StatKey>();

export async function handleInteraction(
  interaction: Interaction,
  repo: CharacterRepository,
  data: ArydiaData
): Promise<void> {
  if (interaction.isChatInputCommand()) {
    await handleCommand(interaction, repo, data);
    return;
  }

  if (interaction.isStringSelectMenu()) {
    await handleSelectMenu(interaction, data);
    return;
  }

  if (interaction.isButton()) {
    await handleButton(interaction, repo, data);
  }
}

async function handleCommand(
  interaction: ChatInputCommandInteraction,
  repo: CharacterRepository,
  data: ArydiaData
): Promise<void> {
  if (interaction.commandName === "create") {
    await handleCreateCommand(interaction, repo, data);
    return;
  }

  if (interaction.commandName === "delete") {
    await handleDeleteCommand(interaction, repo);
    return;
  }

  if (interaction.commandName === "levelup") {
    await handleLevelUpCommand(interaction, repo, data);
    return;
  }

  if (interaction.commandName === "stats") {
    await handleStatsCommand(interaction, repo, data);
    return;
  }

  if (interaction.commandName === "help") {
    await interaction.reply({
      content: formatHelpText(),
      flags: MessageFlags.Ephemeral
    });
  }
}

async function handleCreateCommand(
  interaction: ChatInputCommandInteraction,
  repo: CharacterRepository,
  data: ArydiaData
): Promise<void> {
  const existing = repo.getByUserId(interaction.user.id);
  if (existing) {
    await interaction.reply({
      content: "You already have a bound character. Use `/delete` first if you want to choose another.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await interaction.reply({
    content: "Choose your Arydia character.",
    components: [buildCreateSelectionRow(data)],
    flags: MessageFlags.Ephemeral
  });
}

async function handleDeleteCommand(
  interaction: ChatInputCommandInteraction,
  repo: CharacterRepository
): Promise<void> {
  const character = repo.getByUserId(interaction.user.id);
  if (!character) {
    await interaction.reply({
      content: "You do not have a bound character yet.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await interaction.reply({
    ...buildDeleteConfirmation(character),
    flags: MessageFlags.Ephemeral
  });
}

async function handleLevelUpCommand(
  interaction: ChatInputCommandInteraction,
  repo: CharacterRepository,
  data: ArydiaData
): Promise<void> {
  const character = repo.getByUserId(interaction.user.id);
  if (!character) {
    await interaction.reply({
      content: "You do not have a bound character yet. Use `/create` first.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  if (character.level >= 10) {
    await interaction.reply({
      content: `${character.characterName} is already at maximum level.`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  pendingLevelUps.delete(interaction.user.id);
  await interaction.reply({
    content: `${getLevelUpPrompt(character, data)}\n\nWhich stat do you wish to increase?`,
    components: [buildStatButtons(character, data)],
    flags: MessageFlags.Ephemeral
  });
}

async function handleStatsCommand(
  interaction: ChatInputCommandInteraction,
  repo: CharacterRepository,
  data: ArydiaData
): Promise<void> {
  const character = repo.getByUserId(interaction.user.id);
  if (!character) {
    await interaction.reply({
      content: "You do not have a bound character yet. Use `/create` first.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const previewConfirmation = character.level >= 10 ? { components: [] } : buildStatsPreviewConfirmation();
  await interaction.reply({
    content: formatStatsPrompt(character, data),
    ...previewConfirmation,
    flags: MessageFlags.Ephemeral
  });
}

async function handleSelectMenu(
  interaction: StringSelectMenuInteraction,
  data: ArydiaData
): Promise<void> {
  if (interaction.customId !== "create:select") {
    return;
  }

  const characterName = interaction.values[0];
  await interaction.update(buildCreateConfirmation(characterName, data));
}

async function handleButton(
  interaction: ButtonInteraction,
  repo: CharacterRepository,
  data: ArydiaData
): Promise<void> {
  const [scope, action, value] = interaction.customId.split(":");

  if (scope === "create") {
    await handleCreateButton(interaction, action, value, repo, data);
    return;
  }

  if (scope === "delete") {
    await handleDeleteButton(interaction, action, repo);
    return;
  }

  if (scope === "levelup") {
    await handleLevelUpButton(interaction, action, value, repo, data);
    return;
  }

  if (scope === "stats") {
    await handleStatsButton(interaction, action, repo, data);
  }
}

async function handleCreateButton(
  interaction: ButtonInteraction,
  action: string | undefined,
  characterName: string | undefined,
  repo: CharacterRepository,
  data: ArydiaData
): Promise<void> {
  if (action === "back") {
    await interaction.update({
      content: "Choose your Arydia character.",
      components: [buildCreateSelectionRow(data)]
    });
    return;
  }

  if (action !== "confirm" || !characterName) {
    return;
  }

  if (repo.getByUserId(interaction.user.id)) {
    await interaction.update({
      content: "You already have a bound character. Use `/delete` first if you want to choose another.",
      components: []
    });
    return;
  }

  const character = buildInitialCharacter(interaction.user.id, characterName, data);
  repo.create(character);

  await interaction.update({
    content: `${characterName} is now bound to you.`,
    components: []
  });
  await interaction.followUp({
    content: formatCharacterSheet(`Created ${characterName} character at level 0`, character)
  });
}

async function handleDeleteButton(
  interaction: ButtonInteraction,
  action: string | undefined,
  repo: CharacterRepository
): Promise<void> {
  if (action === "cancel") {
    await interaction.update({
      content: "Deletion cancelled.",
      components: []
    });
    return;
  }

  if (action !== "confirm") {
    return;
  }

  repo.deleteByUserId(interaction.user.id);
  pendingLevelUps.delete(interaction.user.id);
  await interaction.update({
    content: "Your character has been deleted.",
    components: []
  });
}

async function handleLevelUpButton(
  interaction: ButtonInteraction,
  action: string | undefined,
  value: string | undefined,
  repo: CharacterRepository,
  data: ArydiaData
): Promise<void> {
  const character = repo.getByUserId(interaction.user.id);
  if (!character) {
    await interaction.reply({
      content: "You do not have a bound character yet. Use `/create` first.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  if (action === "stat" && isStatKey(value)) {
    pendingLevelUps.set(interaction.user.id, value);
    await interaction.update({
      content: "Which attribute do you wish to increase?",
      components: buildAttributeButtons(character)
    });
    return;
  }

  if (action !== "attribute" || !isAttributeKey(value)) {
    return;
  }

  const statChoice = pendingLevelUps.get(interaction.user.id);
  if (!statChoice) {
    await interaction.reply({
      content: "Please start `/levelup` again and choose a stat first.",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const updated = levelUpCharacter(character, statChoice, value, data);
  repo.updateAfterLevelUp(updated);
  pendingLevelUps.delete(interaction.user.id);

  await interaction.update({
    content: "Level-up complete.",
    components: []
  });
  await interaction.followUp({
    content: formatCharacterSheet(`Your character levelled up to level ${updated.level}`, updated)
  });
}

async function handleStatsButton(
  interaction: ButtonInteraction,
  action: string | undefined,
  repo: CharacterRepository,
  data: ArydiaData
): Promise<void> {
  if (action === "no") {
    await interaction.deferUpdate();
    return;
  }

  if (action !== "yes") {
    return;
  }

  const character = repo.getByUserId(interaction.user.id);
  if (!character) {
    await interaction.update({
      content: "You do not have a bound character yet. Use `/create` first.",
      components: []
    });
    return;
  }

  await interaction.update({
    content: formatNextLevelPreview(character, data),
    components: []
  });
}

function isStatKey(value: string | undefined): value is StatKey {
  return STAT_KEYS.includes(value as StatKey);
}

function isAttributeKey(value: string | undefined): value is AttributeKey {
  return ATTRIBUTES.includes(value as AttributeKey);
}

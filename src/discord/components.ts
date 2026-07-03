import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} from "discord.js";
import { ArydiaData, CharacterRecord, ATTRIBUTES, STAT_KEYS } from "../domain/types.js";
import { attributeValueForLevel } from "../domain/characterService.js";

export function buildCharacterSelectMenu(data: ArydiaData): StringSelectMenuBuilder {
  return new StringSelectMenuBuilder()
    .setCustomId("create:select")
    .setPlaceholder("Choose your Arydia character")
    .addOptions(
      Object.entries(data.characters).map(([name, character]) => ({
        label: name,
        value: name,
        description: character.summary.slice(0, 100)
      }))
    );
}

export function buildCreateSelectionRow(data: ArydiaData): ActionRowBuilder<StringSelectMenuBuilder> {
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(buildCharacterSelectMenu(data));
}

export function buildCreateConfirmation(
  characterName: string,
  data: ArydiaData
): {
  content: string;
  components: ActionRowBuilder<ButtonBuilder>[];
} {
  return {
    content: `You picked ${characterName}, this character is ${data.characters[characterName].summary}`,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`create:confirm:${characterName}`)
          .setLabel("Confirm")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("create:back")
          .setLabel("Back")
          .setStyle(ButtonStyle.Secondary)
      )
    ]
  };
}

export function buildDeleteConfirmation(
  character: CharacterRecord
): {
  content: string;
  components: ActionRowBuilder<ButtonBuilder>[];
} {
  return {
    content: `Delete your ${character.characterName} character? This cannot be undone.`,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("delete:confirm")
          .setLabel("Confirm delete")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("delete:cancel")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Secondary)
      )
    ]
  };
}

export function buildStatsPreviewConfirmation(): {
  components: ActionRowBuilder<ButtonBuilder>[];
} {
  return {
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("stats:yes")
          .setLabel("Yes")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("stats:no")
          .setLabel("No")
          .setStyle(ButtonStyle.Secondary)
      )
    ]
  };
}

export function buildStatButtons(
  character: CharacterRecord,
  data: ArydiaData
): ActionRowBuilder<ButtonBuilder> {
  const nextLevel = character.level + 1;
  const definition = data.characters[character.characterName];

  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    STAT_KEYS.map((stat) =>
      new ButtonBuilder()
        .setCustomId(`levelup:stat:${stat}`)
        .setLabel(`${stat} ${character.stats[stat]} -> ${definition.stats[nextLevel][stat]}`)
        .setStyle(ButtonStyle.Primary)
    )
  );
}

export function buildAttributeButtons(character: CharacterRecord): ActionRowBuilder<ButtonBuilder>[] {
  const nextValue = attributeValueForLevel(character.level + 1);
  const buttons = ATTRIBUTES.map((attribute) =>
    new ButtonBuilder()
      .setCustomId(`levelup:attribute:${attribute}`)
      .setLabel(`${attribute} ${character.attributes[attribute]} -> ${nextValue}`)
      .setStyle(ButtonStyle.Primary)
  );

  return [
    new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(0, 3)),
    new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(3))
  ];
}

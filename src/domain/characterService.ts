import {
  ATTRIBUTES,
  ArydiaData,
  AttributeKey,
  CharacterRecord,
  STAT_KEYS,
  StatKey
} from "./types.js";

export function buildInitialCharacter(
  discordUserId: string,
  characterName: string,
  data: ArydiaData
): CharacterRecord {
  const definition = data.characters[characterName];
  if (!definition) {
    throw new Error(`Unknown character: ${characterName}`);
  }

  return {
    discordUserId,
    characterName,
    level: 0,
    stats: { ...definition.stats[0] },
    attributes: Object.fromEntries(
      ATTRIBUTES.map((attribute) => [
        attribute,
        definition.startingAttributes[attribute] ? 1 : 0
      ])
    ) as CharacterRecord["attributes"]
  };
}

export function levelUpCharacter(
  character: CharacterRecord,
  statChoice: StatKey,
  attributeChoice: AttributeKey,
  data: ArydiaData
): CharacterRecord {
  if (character.level >= 10) {
    throw new Error("Character is already at maximum level");
  }

  const nextLevel = character.level + 1;
  const definition = data.characters[character.characterName];
  if (!definition) {
    throw new Error(`Unknown character: ${character.characterName}`);
  }

  return {
    ...character,
    level: nextLevel,
    stats: {
      ...character.stats,
      [statChoice]: definition.stats[nextLevel][statChoice]
    },
    attributes: {
      ...character.attributes,
      [attributeChoice]: attributeValueForLevel(nextLevel)
    }
  };
}

export function attributeValueForLevel(level: number): number {
  if (level < 0 || level > 10) {
    throw new Error(`Invalid level: ${level}`);
  }

  return level === 0 ? 1 : Math.min(level + 1, 10);
}

export function getLevelUpPrompt(character: CharacterRecord, data: ArydiaData): string {
  if (character.level >= 10) {
    throw new Error("Character is already at maximum level");
  }

  const nextLevel = character.level + 1;
  return `**Level** up! Spend ${data.xpCosts[nextLevel]} XP at the Exiles' Guild, then choose one stat and one attribute to mark for **level** ${nextLevel}.`;
}

export function formatCharacterSheet(title: string, character: CharacterRecord): string {
  const statLines = STAT_KEYS.map((stat) => `**${stat}**: ${character.stats[stat]}`);
  const attributeLines = ATTRIBUTES.map(
    (attribute) => `**${attribute}**: ${character.attributes[attribute]}`
  );

  return `${boldLevelText(title)}\n\n${statLines.join("\n")}\n\n${attributeLines.join("\n")}`;
}

export function formatStatsPrompt(character: CharacterRecord, data: ArydiaData): string {
  const sheet = formatCharacterSheet(
    `${character.characterName} character at level ${character.level}`,
    character
  );

  if (character.level >= 10) {
    return `${sheet}\n\nYou are already at maximum **level**.`;
  }

  const nextLevel = character.level + 1;
  return `${sheet}\n\nYou need ${data.xpCosts[nextLevel]} XP to **level** up to **level** ${nextLevel}.\nDo you want to check next **level**'s stats and attributes?`;
}

export function formatNextLevelPreview(character: CharacterRecord, data: ArydiaData): string {
  if (character.level >= 10) {
    return "You are already at maximum level.";
  }

  const nextLevel = character.level + 1;
  const definition = data.characters[character.characterName];
  if (!definition) {
    throw new Error(`Unknown character: ${character.characterName}`);
  }

  const nextAttributeValue = attributeValueForLevel(nextLevel);
  const statLines = STAT_KEYS.map(
    (stat) => `**${stat}**: ${character.stats[stat]} -> ${definition.stats[nextLevel][stat]}`
  );
  const attributeLines = ATTRIBUTES.map(
    (attribute) => `**${attribute}**: ${character.attributes[attribute]} -> ${nextAttributeValue}`
  );

  return `Next **level** preview for ${character.characterName} **level** ${nextLevel}\n\n${statLines.join("\n")}\n\n${attributeLines.join("\n")}`;
}

export function formatHelpText(): string {
  return [
    "Available Arydia commands:",
    "/create - Create and bind an Arydia character.",
    "/stats - Show your current character sheet and next level preview.",
    "/levelup - Level up your bound character.",
    "/delete - Delete your bound character after confirmation.",
    "/help - Show this command list."
  ].join("\n");
}

function boldLevelText(text: string): string {
  return text.replace(/\blevel\b/gi, (match) => `**${match}**`);
}

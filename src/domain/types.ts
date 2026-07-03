export const STAT_KEYS = ["HP", "MP", "SP"] as const;
export const ATTRIBUTES = ["STR", "DEX", "INT", "WIS", "CHA", "END"] as const;

export type StatKey = (typeof STAT_KEYS)[number];
export type AttributeKey = (typeof ATTRIBUTES)[number];

export type Stats = Record<StatKey, number>;
export type Attributes = Record<AttributeKey, number>;

export type CharacterDefinition = {
  stats: Record<number, Stats>;
  startingAttributes: Record<AttributeKey, boolean>;
  summary: string;
};

export type ArydiaData = {
  characters: Record<string, CharacterDefinition>;
  xpCosts: Record<number, number>;
};

export type CharacterRecord = {
  discordUserId: string;
  characterName: string;
  level: number;
  stats: Stats;
  attributes: Attributes;
};

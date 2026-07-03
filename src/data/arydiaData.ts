import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ATTRIBUTES,
  ArydiaData,
  CharacterDefinition,
  STAT_KEYS,
  Stats
} from "../domain/types.js";

export { ATTRIBUTES, STAT_KEYS };

type RawCharacter = {
  stats: Record<string, Stats>;
  "starting-attributes": Record<string, boolean>;
  summary?: string;
  sumamry?: string;
};

type RawXpCost = {
  "XP-cost": Record<string, number>;
};

export function loadArydiaData(baseDir = process.cwd()): ArydiaData {
  const rawCharacters = JSON.parse(
    readFileSync(join(baseDir, "data", "character.json"), "utf8")
  ) as Record<string, RawCharacter>;
  const rawXpCosts = JSON.parse(
    readFileSync(join(baseDir, "data", "xp-cost.json"), "utf8")
  ) as RawXpCost;

  const characters: Record<string, CharacterDefinition> = {};

  for (const [name, raw] of Object.entries(rawCharacters)) {
    const summary = raw.summary ?? raw.sumamry;
    if (!summary) {
      throw new Error(`${name} is missing summary`);
    }

    const stats: CharacterDefinition["stats"] = {};
    for (let level = 0; level <= 10; level += 1) {
      const levelStats = raw.stats[String(level)];
      if (!levelStats) {
        throw new Error(`${name} is missing stats for level ${level}`);
      }

      stats[level] = normalizeStats(name, level, levelStats);
    }

    const startingAttributes = Object.fromEntries(
      ATTRIBUTES.map((attribute) => {
        const value = raw["starting-attributes"][attribute];
        if (typeof value !== "boolean") {
          throw new Error(`${name} has invalid starting attribute ${attribute}`);
        }
        return [attribute, value];
      })
    ) as CharacterDefinition["startingAttributes"];

    characters[name] = {
      stats,
      startingAttributes,
      summary
    };
  }

  const xpCosts = Object.fromEntries(
    Object.entries(rawXpCosts["XP-cost"]).map(([level, cost]) => [Number(level), cost])
  ) as ArydiaData["xpCosts"];

  for (let level = 1; level <= 10; level += 1) {
    if (typeof xpCosts[level] !== "number") {
      throw new Error(`Missing XP cost for level ${level}`);
    }
  }

  return { characters, xpCosts };
}

function normalizeStats(name: string, level: number, stats: Stats): Stats {
  const normalized = Object.fromEntries(
    STAT_KEYS.map((stat) => {
      const value = stats[stat];
      if (typeof value !== "number") {
        throw new Error(`${name} level ${level} has invalid ${stat}`);
      }
      return [stat, value];
    })
  ) as Stats;

  return normalized;
}

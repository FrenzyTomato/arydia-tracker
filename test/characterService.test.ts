import assert from "node:assert/strict";
import test from "node:test";
import { loadArydiaData } from "../src/data/arydiaData.js";
import {
  buildInitialCharacter,
  formatCharacterSheet,
  formatHelpText,
  formatNextLevelPreview,
  formatStatsPrompt,
  getLevelUpPrompt,
  levelUpCharacter
} from "../src/domain/characterService.js";

test("buildInitialCharacter creates level 0 stats and starting attributes", () => {
  const data = loadArydiaData();
  const character = buildInitialCharacter("user-1", "Human", data);

  assert.equal(character.discordUserId, "user-1");
  assert.equal(character.characterName, "Human");
  assert.equal(character.level, 0);
  assert.deepEqual(character.stats, { HP: 4, MP: 2, SP: 1 });
  assert.deepEqual(character.attributes, {
    STR: 1,
    DEX: 1,
    INT: 1,
    WIS: 0,
    CHA: 0,
    END: 0
  });
});

test("levelUpCharacter changes only the chosen stat and chosen attribute", () => {
  const data = loadArydiaData();
  const level0 = buildInitialCharacter("user-1", "Human", data);
  const level1 = levelUpCharacter(level0, "SP", "WIS", data);

  assert.equal(level1.level, 1);
  assert.deepEqual(level1.stats, { HP: 4, MP: 2, SP: 2 });
  assert.deepEqual(level1.attributes, {
    STR: 1,
    DEX: 1,
    INT: 1,
    WIS: 2,
    CHA: 0,
    END: 0
  });
});

test("levelUpCharacter jumps selected values to the next level column", () => {
  const data = loadArydiaData();
  const level0 = buildInitialCharacter("user-1", "Human", data);
  const level1 = levelUpCharacter(level0, "HP", "STR", data);
  const level2 = levelUpCharacter(level1, "MP", "CHA", data);

  assert.equal(level2.level, 2);
  assert.deepEqual(level2.stats, { HP: 5, MP: 4, SP: 1 });
  assert.deepEqual(level2.attributes, {
    STR: 2,
    DEX: 1,
    INT: 1,
    WIS: 0,
    CHA: 3,
    END: 0
  });
});

test("levelUpCharacter blocks max-level characters", () => {
  const data = loadArydiaData();
  const level10 = {
    ...buildInitialCharacter("user-1", "Human", data),
    level: 10
  };

  assert.throws(() => levelUpCharacter(level10, "HP", "STR", data), /maximum level/i);
});

test("getLevelUpPrompt includes the next level xp cost", () => {
  const data = loadArydiaData();
  const character = buildInitialCharacter("user-1", "Human", data);

  assert.equal(
    getLevelUpPrompt(character, data),
    "Level up! Spend 3 XP at the Exiles' Guild, then choose one stat and one attribute to mark for level 1."
  );
});

test("formatCharacterSheet matches the requested output shape", () => {
  const data = loadArydiaData();
  const character = buildInitialCharacter("user-1", "Human", data);

  assert.equal(
    formatCharacterSheet("Created Human character at level 0", character),
    "Created Human character at level 0\n\nHP: 4\nMP: 2\nSP: 1\n\nSTR: 1\nDEX: 1\nINT: 1\nWIS: 0\nCHA: 0\nEND: 0"
  );
});

test("formatStatsPrompt shows current character sheet and next xp cost", () => {
  const data = loadArydiaData();
  const character = buildInitialCharacter("user-1", "Human", data);

  assert.equal(
    formatStatsPrompt(character, data),
    "Human character at level 0\n\nHP: 4\nMP: 2\nSP: 1\n\nSTR: 1\nDEX: 1\nINT: 1\nWIS: 0\nCHA: 0\nEND: 0\n\nYou need 3 XP to level up to level 1.\nDo you want to check next level's stats and attributes?"
  );
});

test("formatStatsPrompt handles max-level characters", () => {
  const data = loadArydiaData();
  const character = {
    ...buildInitialCharacter("user-1", "Human", data),
    level: 10
  };

  assert.equal(
    formatStatsPrompt(character, data),
    "Human character at level 10\n\nHP: 4\nMP: 2\nSP: 1\n\nSTR: 1\nDEX: 1\nINT: 1\nWIS: 0\nCHA: 0\nEND: 0\n\nYou are already at maximum level."
  );
});

test("formatNextLevelPreview shows current to next level values", () => {
  const data = loadArydiaData();
  const character = buildInitialCharacter("user-1", "Human", data);

  assert.equal(
    formatNextLevelPreview(character, data),
    "Next level preview for Human level 1\n\nHP: 4 -> 5\nMP: 2 -> 3\nSP: 1 -> 2\n\nSTR: 1 -> 2\nDEX: 1 -> 2\nINT: 1 -> 2\nWIS: 0 -> 2\nCHA: 0 -> 2\nEND: 0 -> 2"
  );
});

test("formatHelpText lists available slash commands", () => {
  assert.equal(
    formatHelpText(),
    "Available Arydia commands:\n/create - Create and bind an Arydia character.\n/stats - Show your current character sheet and next level preview.\n/levelup - Level up your bound character.\n/delete - Delete your bound character after confirmation.\n/help - Show this command list."
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import { loadArydiaData, ATTRIBUTES, STAT_KEYS } from "../src/data/arydiaData.js";

test("character data has complete stats, starting attributes, and summaries", () => {
  const data = loadArydiaData();

  assert.deepEqual(Object.keys(data.characters), [
    "Lunari",
    "Elf",
    "Felish",
    "Fae",
    "Human",
    "Halfling",
    "Slynn",
    "Orc",
    "Dwarf"
  ]);

  for (const [name, character] of Object.entries(data.characters)) {
    assert.ok(character.summary.length > 0, `${name} should have a summary`);
    assert.equal(Object.keys(character.stats).length, 11, `${name} should have levels 0-10`);

    for (let level = 0; level <= 10; level += 1) {
      const stats = character.stats[level];
      assert.ok(stats, `${name} missing level ${level}`);
      for (const stat of STAT_KEYS) {
        assert.equal(typeof stats[stat], "number", `${name} level ${level} ${stat}`);
      }
    }

    assert.deepEqual(Object.keys(character.startingAttributes), ATTRIBUTES);
  }
});

test("xp costs are loaded for levels 1-10", () => {
  const data = loadArydiaData();

  assert.equal(data.xpCosts[1], 3);
  assert.equal(data.xpCosts[4], 10);
  assert.equal(data.xpCosts[10], 50);
  assert.deepEqual(Object.keys(data.xpCosts).map(Number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

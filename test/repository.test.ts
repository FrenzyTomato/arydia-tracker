import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { loadArydiaData } from "../src/data/arydiaData.js";
import { buildInitialCharacter, levelUpCharacter } from "../src/domain/characterService.js";
import { CharacterRepository } from "../src/db/characterRepository.js";

test("repository creates, prevents duplicates, stores footprints, updates, and deletes", () => {
  const db = new DatabaseSync(":memory:");
  const repo = new CharacterRepository(db);
  repo.initialize();
  const data = loadArydiaData();
  const level0 = buildInitialCharacter("user-1", "Human", data);

  repo.create(level0);
  assert.deepEqual(repo.getByUserId("user-1"), level0);
  assert.throws(() => repo.create(level0), /already has/i);
  assert.equal(repo.getFootprints("user-1").length, 1);

  const level1 = levelUpCharacter(level0, "SP", "WIS", data);
  repo.updateAfterLevelUp(level1);

  assert.deepEqual(repo.getByUserId("user-1"), level1);
  assert.equal(repo.getFootprints("user-1").length, 2);

  repo.deleteByUserId("user-1");
  assert.equal(repo.getByUserId("user-1"), null);
  assert.deepEqual(repo.getFootprints("user-1"), []);
});

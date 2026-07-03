import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { loadArydiaData } from "../src/data/arydiaData.js";
import { CharacterRepository } from "../src/db/characterRepository.js";
import { handleInteraction } from "../src/discord/interactionHandler.js";

test("stats no button removes buttons from the existing prompt", async () => {
  const data = loadArydiaData();
  const repo = new CharacterRepository(new DatabaseSync(":memory:"));
  repo.initialize();
  const updates: unknown[] = [];
  let deferred = false;
  const interaction = {
    customId: "stats:no",
    user: { id: "user-1" },
    isChatInputCommand: () => false,
    isStringSelectMenu: () => false,
    isButton: () => true,
    update: async (payload: unknown) => {
      updates.push(payload);
    },
    deferUpdate: async () => {
      deferred = true;
    }
  };

  await handleInteraction(interaction as never, repo, data);

  assert.equal(deferred, false);
  assert.deepEqual(updates, [{ components: [] }]);
});

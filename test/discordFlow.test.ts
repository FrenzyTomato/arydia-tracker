import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAttributeButtons,
  buildCharacterSelectMenu,
  buildCreateConfirmation,
  buildDeleteConfirmation,
  buildStatsPreviewConfirmation,
  buildStatButtons
} from "../src/discord/components.js";
import { loadArydiaData } from "../src/data/arydiaData.js";
import { buildInitialCharacter } from "../src/domain/characterService.js";

test("create flow components expose character selection and confirmation controls", () => {
  const data = loadArydiaData();
  const select = buildCharacterSelectMenu(data);
  const confirmation = buildCreateConfirmation("Human", data);

  assert.equal(select.data.custom_id, "create:select");
  assert.equal(select.options.length, 9);
  assert.equal(confirmation.content, `You picked Human, this character is ${data.characters.Human.summary}`);
  assert.equal(confirmation.components.length, 1);
});

test("level-up components expose stat and attribute choices", () => {
  const data = loadArydiaData();
  const character = buildInitialCharacter("user-1", "Human", data);
  const statButtons = buildStatButtons(character, data);
  const attributeButtons = buildAttributeButtons(character);

  assert.deepEqual(
    statButtons.components.map((button) => buttonLabel(button.toJSON())),
    ["HP 4 -> 5", "MP 2 -> 3", "SP 1 -> 2"]
  );
  assert.deepEqual(
    attributeButtons.flatMap((row) => row.components.map((button) => buttonLabel(button.toJSON()))),
    ["STR 1 -> 2", "DEX 1 -> 2", "INT 1 -> 2", "WIS 0 -> 2", "CHA 0 -> 2", "END 0 -> 2"]
  );
});

test("delete flow component exposes confirm and cancel controls", () => {
  const data = loadArydiaData();
  const character = buildInitialCharacter("user-1", "Human", data);
  const confirmation = buildDeleteConfirmation(character);

  assert.match(confirmation.content, /Delete your Human character/);
  assert.deepEqual(
    confirmation.components[0].components.map((button) => buttonLabel(button.toJSON())),
    ["Confirm delete", "Cancel"]
  );
});

test("stats flow component exposes yes and no controls", () => {
  const confirmation = buildStatsPreviewConfirmation();

  assert.deepEqual(
    confirmation.components[0].components.map((button) => buttonLabel(button.toJSON())),
    ["Yes", "No"]
  );
});

function buttonLabel(component: unknown): string | undefined {
  return (component as { label?: string }).label;
}

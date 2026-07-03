import assert from "node:assert/strict";
import test from "node:test";
import { buildSlashCommands } from "../src/discord/commands.js";

test("buildSlashCommands registers create delete levelup stats and help", () => {
  const commands = buildSlashCommands().map((command) => command.toJSON());

  assert.deepEqual(
    commands.map((command) => command.name),
    ["create", "delete", "levelup", "stats", "help"]
  );
  assert.match(commands[0].description, /create/i);
  assert.match(commands[1].description, /delete/i);
  assert.match(commands[2].description, /level/i);
  assert.match(commands[3].description, /stats/i);
  assert.match(commands[4].description, /help/i);
});

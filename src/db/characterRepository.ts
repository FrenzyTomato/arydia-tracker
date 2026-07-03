import { DatabaseSync } from "node:sqlite";
import { ATTRIBUTES, CharacterRecord, STAT_KEYS } from "../domain/types.js";

type CharacterRow = {
  discord_user_id: string;
  character_name: string;
  level: number;
  hp: number;
  mp: number;
  sp: number;
  str: number;
  dex: number;
  int: number;
  wis: number;
  cha: number;
  end: number;
};

export class CharacterRepository {
  constructor(private readonly db: DatabaseSync) {}

  initialize(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS characters (
        discord_user_id TEXT PRIMARY KEY,
        character_name TEXT NOT NULL,
        level INTEGER NOT NULL,
        hp INTEGER NOT NULL,
        mp INTEGER NOT NULL,
        sp INTEGER NOT NULL,
        str INTEGER NOT NULL,
        dex INTEGER NOT NULL,
        int INTEGER NOT NULL,
        wis INTEGER NOT NULL,
        cha INTEGER NOT NULL,
        end INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS level_up_footprints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        discord_user_id TEXT NOT NULL,
        character_name TEXT NOT NULL,
        level INTEGER NOT NULL,
        hp INTEGER NOT NULL,
        mp INTEGER NOT NULL,
        sp INTEGER NOT NULL,
        str INTEGER NOT NULL,
        dex INTEGER NOT NULL,
        int INTEGER NOT NULL,
        wis INTEGER NOT NULL,
        cha INTEGER NOT NULL,
        end INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  getByUserId(discordUserId: string): CharacterRecord | null {
    const row = this.db
      .prepare("SELECT * FROM characters WHERE discord_user_id = ?")
      .get(discordUserId) as CharacterRow | undefined;

    return row ? rowToCharacter(row) : null;
  }

  create(character: CharacterRecord): void {
    if (this.getByUserId(character.discordUserId)) {
      throw new Error("User already has a character");
    }

    this.insertCharacter(character);
    this.insertFootprint(character);
  }

  updateAfterLevelUp(character: CharacterRecord): void {
    this.db
      .prepare(
        `UPDATE characters
         SET level = ?, hp = ?, mp = ?, sp = ?, str = ?, dex = ?, int = ?, wis = ?, cha = ?, end = ?, updated_at = CURRENT_TIMESTAMP
         WHERE discord_user_id = ?`
      )
      .run(
        character.level,
        character.stats.HP,
        character.stats.MP,
        character.stats.SP,
        character.attributes.STR,
        character.attributes.DEX,
        character.attributes.INT,
        character.attributes.WIS,
        character.attributes.CHA,
        character.attributes.END,
        character.discordUserId
      );
    this.insertFootprint(character);
  }

  deleteByUserId(discordUserId: string): void {
    this.db.prepare("DELETE FROM level_up_footprints WHERE discord_user_id = ?").run(discordUserId);
    this.db.prepare("DELETE FROM characters WHERE discord_user_id = ?").run(discordUserId);
  }

  getFootprints(discordUserId: string): CharacterRecord[] {
    const rows = this.db
      .prepare("SELECT * FROM level_up_footprints WHERE discord_user_id = ? ORDER BY level ASC, id ASC")
      .all(discordUserId) as CharacterRow[];

    return rows.map(rowToCharacter);
  }

  private insertCharacter(character: CharacterRecord): void {
    this.db
      .prepare(
        `INSERT INTO characters (
          discord_user_id, character_name, level, hp, mp, sp, str, dex, int, wis, cha, end
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(...characterValues(character));
  }

  private insertFootprint(character: CharacterRecord): void {
    this.db
      .prepare(
        `INSERT INTO level_up_footprints (
          discord_user_id, character_name, level, hp, mp, sp, str, dex, int, wis, cha, end
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(...characterValues(character));
  }
}

function characterValues(character: CharacterRecord): [
  string,
  string,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
] {
  return [
    character.discordUserId,
    character.characterName,
    character.level,
    ...STAT_KEYS.map((stat) => character.stats[stat]),
    ...ATTRIBUTES.map((attribute) => character.attributes[attribute])
  ] as ReturnType<typeof characterValues>;
}

function rowToCharacter(row: CharacterRow): CharacterRecord {
  return {
    discordUserId: row.discord_user_id,
    characterName: row.character_name,
    level: row.level,
    stats: {
      HP: row.hp,
      MP: row.mp,
      SP: row.sp
    },
    attributes: {
      STR: row.str,
      DEX: row.dex,
      INT: row.int,
      WIS: row.wis,
      CHA: row.cha,
      END: row.end
    }
  };
}

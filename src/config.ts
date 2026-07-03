import "dotenv/config";

export type BotConfig = {
  discordToken: string;
  discordClientId: string;
  discordGuildId: string;
  databasePath: string;
};

export function loadConfig(): BotConfig {
  const discordToken = requireEnv("DISCORD_TOKEN");
  const discordClientId = requireEnv("DISCORD_CLIENT_ID");
  const discordGuildId = requireEnv("DISCORD_GUILD_ID");
  const databasePath = process.env.DATABASE_PATH ?? "./arydia.db";

  return {
    discordToken,
    discordClientId,
    discordGuildId,
    databasePath
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

# Arydia Discord Bot

A Discord slash-command bot for tracking Arydia board game character stats across sessions.

Each Discord user can bind one Arydia character, level it up, inspect current stats, and keep a footprint history of the character state at creation and each level-up.

## Features

- `/create` - Pick and bind one Arydia character to your Discord user.
- `/levelup` - Spend the listed XP outside the bot, then choose one stat and one attribute to bump.
- `/stats` - Show your current character sheet and optionally preview next-level values.
- `/delete` - Delete your bound character after confirmation.
- `/help` - Show the command list.

Privacy behavior:

- `/create`, `/levelup`, `/delete`, `/stats`, and `/help` prompts are private ephemeral interaction responses.
- `/stats` and `/help` are fully private.
- The final `/create` and `/levelup` result messages are public so the table can see character progress.

## Requirements

- Node.js `>=22.22.0`
- npm
- A Discord application and bot token
- A place to run a long-lived Node process
- Persistent disk if deployed, because character state is stored in SQLite

This bot uses Node's built-in `node:sqlite` module via `DatabaseSync`, so commands that touch the bot runtime use `--experimental-sqlite`. See the Node SQLite docs: <https://nodejs.org/api/sqlite.html>.

## Project Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file:

```bash
cp .env.example .env
```

Fill in:

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_server_id
DATABASE_PATH=./arydia.db
```

Do not commit `.env` or the SQLite database file.

## Discord Setup

1. Open the Discord Developer Portal: <https://discord.com/developers/applications>
2. Create an application.
3. Go to the **Bot** tab.
4. Create a bot and copy/reset its token.
5. Put the token in `DISCORD_TOKEN`.
6. Copy the application ID into `DISCORD_CLIENT_ID`.
7. Enable Developer Mode in Discord, right-click your server, copy the server ID, and put it in `DISCORD_GUILD_ID`.

Invite the bot:

1. In the Developer Portal, open **OAuth2**.
2. Use the URL Generator.
3. Select scopes:
   - `bot`
   - `applications.commands`
4. Select bot permissions:
   - `View Channels`
   - `Send Messages`
5. Open the generated URL and add the bot to your server.

Discord's docs cover application commands and the `applications.commands` scope here: <https://discord.com/developers/docs/interactions/application-commands>.

## Register Slash Commands

This project registers guild commands for the server in `DISCORD_GUILD_ID`. Guild commands update quickly and are best for a private game server.

Run:

```bash
npm run register:commands
```

Run this again whenever slash commands change.

## Run Locally

Start the bot:

```bash
npm start
```

You should see a log similar to:

```text
Arydia bot logged in as YourBotName#0000
```

Then use `/help` in your Discord server.

## Deployment

The current implementation uses Discord's Gateway through `discord.js`, so it needs a long-running Node process. Use a VPS or app host that keeps a process alive.

The important deployment requirements are:

- Node.js `>=22.22.0`
- Start command: `npm start`
- Environment variables from `.env.example`
- Persistent storage for `DATABASE_PATH`

If the database is stored on an ephemeral filesystem, character data can disappear when the service restarts or redeploys.

## How to Use

### Create a Character

Use:

```text
/create
```

The bot privately asks you to pick a character. After you confirm, it creates the character at level 0. The final created character sheet is posted publicly.

If you already have a character, the bot asks you to use `/delete` first.

### Check Current Stats

Use:

```text
/stats
```

The bot privately shows:

- Character name
- Current level
- HP, MP, SP
- STR, DEX, INT, WIS, CHA, END
- XP needed for the next level

It then asks whether you want to preview next-level values.

- `Yes` updates the private message with `<current> -> <next>` values.
- `No` does nothing visible.

### Level Up

Use:

```text
/levelup
```

The bot privately shows the XP cost for the next level. XP is displayed only; the bot does not track XP balance.

Then choose:

1. One stat: HP, MP, or SP
2. One attribute: STR, DEX, INT, WIS, CHA, or END

Only the chosen stat and chosen attribute jump to the new level's value. Unchosen values stay unchanged.

After completion, the final updated character sheet is posted publicly and stored in the level-up footprint history.

### Delete a Character

Use:

```text
/delete
```

The bot privately asks for confirmation. Confirming deletes the bound character and its footprint history.

### Help

Use:

```text
/help
```

The bot privately lists available commands.

## Data Model

Character source data lives in:

- `data/character.json`
- `data/xp-cost.json`

SQLite stores:

- One active character per Discord user ID
- Current level
- Current stats and attributes
- A footprint row for creation and every completed level-up

The default local database path is:

```text
./arydia.db
```

## Development

Run tests:

```bash
npm test
```

Typecheck:

```bash
npm run build
```

Check production dependency advisories:

```bash
npm audit --omit=dev
```

## Troubleshooting

### Slash commands do not show up

Run:

```bash
npm run register:commands
```

Make sure:

- `DISCORD_CLIENT_ID` is the application ID.
- `DISCORD_GUILD_ID` is the server ID.
- The bot was invited to that server.
- The invite included `applications.commands`.

### Bot is offline

Check:

- `npm start` is still running.
- `DISCORD_TOKEN` is valid.
- The host is not sleeping or stopping the process.
- Deployment logs show the bot logged in.

### Data disappeared after deployment

Your SQLite database was probably stored on ephemeral disk. Move `DATABASE_PATH` to a persistent disk or volume, then redeploy.

### Private messages are not visible to other users

That is expected. The bot uses Discord ephemeral interaction responses for private prompts. Discord documents the `EPHEMERAL` interaction response flag here: <https://discord.com/developers/docs/interactions/receiving-and-responding>.

### Commands changed but Discord still shows old behavior

Register commands again:

```bash
npm run register:commands
```

Then restart the bot.

# Subsquid Quests Bot

A Discord bot helping to manage various community quests. 

## Configuring

Set up the bot: https://discord.com/developers/

The main config file is [`src/config.ts`](./src/config.ts). By default, the bot will try to connect to locally running PostgreSQL (localhost, port 5432). You can override this behavior by sending an entire conection string in `DATABASE_URL` environment variable. When using this variable, a configuration property `database` from the config file gets ignored. 

Admin must deploy slash commands to server using `!deploy` message. 

## Building

Install the dependencies using `npm install`

Production build using `npm run build`

## Running

Run the bot in dev environment using `TOKEN=<discord bot token> npm run start:dev`

Run the bot in prod environment using `TOKEN=<discord bot token> npm run start:prod`

## Troubleshooting

`DiscordAPIError: Missing Access`

Authorize the bot using https://discord.com/oauth2/authorize?client_id=<bot client id>&permissions=1133584&scope=bot
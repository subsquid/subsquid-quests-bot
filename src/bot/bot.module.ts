import { DiscordModule, DiscordModuleOption } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Intents, Message } from 'discord.js';
import { QuestsModule } from 'src/quests/quests.module';
import { BotGateway } from './bot.gateway';
import { QuestsMonitor } from './quests.response.monitor';

@Module({
  imports: [
    DiscordModule.forRootAsync({
      imports: [ConfigModule, QuestsModule],
      useFactory: (configService: ConfigService) => ({
        token: configService.get('TOKEN'),
        commands: ['**/*.command.js'],
        discordClientOptions: {
          intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
        },
        removeGlobalCommands: true,
        registerCommandOptions: [
          {
            forGuild: configService.get('GUILD_ID_WITH_COMMANDS'),
            allowFactory: (message: Message) =>
              !message.author.bot && message.content === '!deploy',
            removeCommandsBefore: true,
          },
        ],
      } as DiscordModuleOption),
      inject: [ConfigService],
    }),
    QuestsModule
  ],
  providers: [BotGateway, QuestsMonitor]
})
export class BotModule {}
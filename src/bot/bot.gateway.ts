import { Injectable, Logger } from '@nestjs/common';
import { Once, DiscordClientProvider } from '@discord-nestjs/core';
import { botConfig } from '../config';
import { Quest } from 'src/db/quest.entity';
import { MessageEmbed, Snowflake, TextChannel } from 'discord.js';
import { QuestsService } from 'src/quests/quests.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    private readonly discordProvider: DiscordClientProvider,
    private readonly questsService: QuestsService) {}

  @Once('ready')
  async onReady(): Promise<void> {
    this.logger.log(
      `Logged in as ${this.discordProvider.getClient()?.user?.tag}!`,
    );
    await this.discordProvider.getClient().channels.fetch(botConfig.announceChannel);
  }

  @Cron(CronExpression.EVERY_30_SECONDS, {
    name: 'notifications',
    timeZone: 'Europe/Paris',
  })
  async announceNewQuests(): Promise<void> {
    
    this.logger.debug('Checking for quests that need to be announced...');
    this.questsService.findQuestsToAnnounce()
      .then((quests: Quest[]) => {
        this.logger.debug(`Announcing ${quests.length} new quests...`);
        quests.forEach((q: Quest) => {
          this.announceNewQuest(q).then((result: Snowflake) => {
            q.announcementMessageId = result.toString();
            this.questsService.saveQuest(q);
          })
        })
      })
  }

  async announceNewQuest(quest: Quest): Promise<Snowflake> {
    const channel: TextChannel = this.discordProvider.getClient().channels.cache.get(botConfig.announceChannel) as TextChannel;
    const sentMessage = await channel.send({embeds: [this.createAnnouncementEmbed(quest)]})
    this.logger.debug(`Announced ${sentMessage.id}`);
    return sentMessage.id;
  }

  createAnnouncementEmbed(q: Quest): MessageEmbed {
    return new MessageEmbed()
        .setTitle(`🏛 🏛 🏛 New Quest '${q.title}' available!`)
        .setDescription(`${q.description}`);
  }

}
import { Injectable, Logger } from '@nestjs/common';
import { Once, DiscordClientProvider } from '@discord-nestjs/core';
import { botConfig } from '../config';
import { Quest } from 'src/db/quest.entity';
import { Snowflake, TextChannel } from 'discord.js';
import { QuestsService } from 'src/quests/quests.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuestsMonitor } from './quests.response.monitor';
import { BotEmbeds } from './bot.embeds';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    private readonly discordProvider: DiscordClientProvider,
    private readonly questsMonitor: QuestsMonitor,
    private readonly questsService: QuestsService,
    private readonly embedsProvider: BotEmbeds) { }

  @Once('ready')
  async onReady(): Promise<void> {
    this.logger.log(
      `Logged in as ${this.discordProvider.getClient()?.user?.tag}!`,
    );
    await this.discordProvider.getClient().channels.fetch(botConfig.announceChannel);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  restartComponentInteractionListener() {
    this.questsMonitor.respawnCollector();
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async announceNewQuests(): Promise<void> {

    this.logger.debug('Checking for quests that need to be announced...');
    this.questsService.findQuestsToAnnounce()
      .then((quests) => {
        if(quests.length > 0) {
          this.logger.debug(`Announcing ${quests.length} new quests...`);
        }
        quests.forEach((q) => {
          let model: Quest = q.get(); // get plain JS object
          this.announceNewQuest(model).then((result) => {
            model.announcementMessageId = result.toString();
            this.questsService.saveQuest(model);
          })
        })
      })
  }

  async announceNewQuest(quest: Quest): Promise<Snowflake> {
    const channel: TextChannel = this.discordProvider.getClient().channels.cache.get(botConfig.announceChannel) as TextChannel;
    const sentMessage = await channel.send(this.embedsProvider.prepareQuestAnnounce(quest));
    this.logger.debug(`Announced ${sentMessage.id}`);
    return sentMessage.id;
  }
}
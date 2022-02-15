import { Injectable, Logger } from '@nestjs/common';
import { Once, DiscordClientProvider } from '@discord-nestjs/core';
import { botConfig } from '../config';
import { Quest } from 'src/db/quest.entity';
import { MessageActionRow, MessageButton, MessageEmbed, Snowflake, TextChannel, MessageOptions } from 'discord.js';
import { QuestsService } from 'src/quests/quests.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { QuestsMonitor } from './quests.response.monitor';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(
    private readonly discordProvider: DiscordClientProvider,
    private readonly questsMonitor: QuestsMonitor,
    private readonly questsService: QuestsService) { }

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
        this.logger.debug(`Announcing ${quests.length} new quests...`);
        quests.forEach((q) => {
          q = JSON.parse(JSON.stringify(q));
          this.announceNewQuest(q).then((result) => {
            q.announcementMessageId = result.toString();
            this.questsService.saveQuest(q);
          })
        })
      })
  }

  async announceNewQuest(quest: Quest): Promise<Snowflake> {
    const channel: TextChannel = this.discordProvider.getClient().channels.cache.get(botConfig.announceChannel) as TextChannel;
    const actions = this.createActions(quest);
    const message = { 
      content: 'New quest available', 
      embeds: [this.createAnnouncementEmbed(quest)] 
    } as MessageOptions;
    if(actions) {
      message.components = [actions];
    }
    const sentMessage = await channel.send(message);
    this.logger.debug(`Announced ${sentMessage.id}`);
    return sentMessage.id;
  }

  createActions(quest: Quest): MessageActionRow {
    const claimButton = new MessageButton().setCustomId(`claim_${quest.id}`).setLabel('Claim').setStyle('PRIMARY')
    const unClaimButton = new MessageButton().setCustomId(`unclaim_${quest.id}`).setLabel('Unclaim').setStyle('PRIMARY');
    const submitForReviewButton = new MessageButton().setCustomId(`submit_${quest.id}`).setLabel('Submit for Review').setStyle('PRIMARY');

    switch(quest.status) {
      case 'OPEN': 
        return new MessageActionRow().addComponents([claimButton, unClaimButton]);
        break;
      case 'CLAIMED':
        return new MessageActionRow().addComponents([submitForReviewButton]);
        break;
      default: 
        return null as unknown as MessageActionRow;
    }
  }

  createAnnouncementEmbed(q: Quest): MessageEmbed {
    return new MessageEmbed()
      .setTitle(`🏛 🏛 🏛 ${q.title}'`)
      .setDescription(`${q.description}`)
      .addField('ID', `${q.id}`, true)
      .addField('Valid until', `${q.expiresOn}`, true)
      .addField('Workers required', `${q.maxApplicants}`, true)
      .addField('Reward', `${q.rewards}`, true)
      .addField('Status', `${q.status}`, true)
  }
}
import { DiscordClientProvider } from "@discord-nestjs/core";
import { Injectable, Logger } from "@nestjs/common";
import { MessageComponentInteraction, TextChannel } from "discord.js";
import { QuestsService } from "src/quests/quests.service";
import { botConfig } from '../config';
import { BotEmbeds } from "./bot.embeds";

@Injectable()
export class QuestsMonitor {
  private readonly logger = new Logger(QuestsMonitor.name);

  constructor(
    private readonly discordProvider: DiscordClientProvider,
    private readonly questsService: QuestsService,
    private readonly embedsProvider: BotEmbeds) { }

  respawnCollector() {

    this.logger.debug('Restarting the collector');
    const channel: TextChannel = this.discordProvider.getClient().channels.cache.get(botConfig.announceChannel) as TextChannel;
    // const message = channel.messages.cache.get(quest.announcementMessageId || '');
    const filter = (i: MessageComponentInteraction) => !i.user.bot;
    let collector = channel.createMessageComponentCollector({ filter, time: 10000 });
    collector.on('collect', (interaction) => {
      let split = interaction.customId.split('_');
      const action = split[0];
      const questId = split[1];
      if (action === 'claim') {
        this.questsService.claimQuest(+questId, `${interaction.user.username}#${interaction.user.discriminator}`).then(
          async (claimed) => {
            if (claimed) {
              const quest = await this.questsService.findOne(+questId);
              interaction.update(this.embedsProvider.prepareQuestAnnounce(quest?.get()))
            } else {
              interaction.reply({ content: 'Quest not claimed', ephemeral: true })
            }
          }
        )
      } else if (action === 'submit') {
        this.questsService.submitQuestForReview(+questId, `${interaction.user.username}#${interaction.user.discriminator}`).then(
          async (submitted) => {
            if (submitted) {
              const quest = await this.questsService.findOne(+questId);
              interaction.update(this.embedsProvider.prepareQuestAnnounce(quest?.get()))
              const server = this.discordProvider.getClient().guilds.cache.get(botConfig.server);
              if (server) {
                botConfig.adminRoles.forEach(roleName => {
                  const role = server.roles.cache.find(r => r.name === roleName);
                  if (role) {
                    role.members.filter(member => !member.user.bot)?.forEach(admin => {
                      admin.send({ content: `Time to review the Quest #${questId} !` }).catch()
                    })
                  } else {
                    this.logger.warn(`Admin role ${roleName} not found on this server`);
                  }
                })
              } else {
                this.logger.warn('Server not configured! Unable to ping admins');
              }
            } else {
              interaction.reply({ content: 'Quest not submitted', ephemeral: true })
            }
          }
        )
      }
      // if(split[0] === 'unclaim') {
      //     this.questsService.claimQuest(+split[1], interaction.user.username);
      // }
    })
    collector.on('end', (collected) => {
      this.logger.debug('Collector expired');
    })
  }
}
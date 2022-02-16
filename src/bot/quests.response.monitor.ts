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
            if (split[0] === 'claim') {
                this.questsService.claimQuest(+split[1], `${interaction.user.username}#${interaction.user.discriminator}`).then(
                    async (claimed) => {
                        if (claimed) {
                            const quest = await this.questsService.findOne(+split[1]);
                            interaction.update(this.embedsProvider.prepareQuestAnnounce(quest?.get()))
                        } else {
                            interaction.reply({ content: 'Quest not claimed', ephemeral: true })
                        }
                    }
                )
            } else if (split[0] === 'submit') {
                this.questsService.submitQuestForReview(+split[1], `${interaction.user.username}#${interaction.user.discriminator}`).then(
                    async (submitted) => {
                        if (submitted) {
                            const quest = await this.questsService.findOne(+split[1]);
                            interaction.update(this.embedsProvider.prepareQuestAnnounce(quest?.get()))
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
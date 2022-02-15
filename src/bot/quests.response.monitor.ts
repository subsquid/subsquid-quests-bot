import { DiscordClientProvider } from "@discord-nestjs/core";
import { Injectable, Logger } from "@nestjs/common";
import { MessageComponentInteraction, TextChannel } from "discord.js";
import { QuestsService } from "src/quests/quests.service";
import { botConfig } from '../config';

@Injectable()
export class QuestsMonitor {
    private readonly logger = new Logger(QuestsMonitor.name);

    constructor(
        private readonly discordProvider: DiscordClientProvider,
        private readonly questsService: QuestsService) { }

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
                    (claimed) => {
                        if (claimed) {
                            interaction.reply({ content: 'You claimed this Quest!', ephemeral: true })
                        } else {
                            interaction.reply({ content: 'Quest not claimed', ephemeral: true })
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
import { Injectable } from "@nestjs/common";
import { MessageActionRow, MessageButton, MessageEmbed, MessageOptions } from "discord.js";
import { Quest } from "src/db/quest.entity";

@Injectable()
export class BotEmbeds {

    prepareQuestAnnounce(quest: Quest): MessageOptions {
        const actions = this.createActions(quest);
        const message = {
          content: 'New quest available',
          embeds: [this.createAnnouncementEmbed(quest)]
        } as MessageOptions;
        if(actions) {
          message.components = [actions];
        } else {
          message.components = [];
        }
        return message;
    }

    createActions(quest: Quest): MessageActionRow {
        const claimButton = new MessageButton().setCustomId(`claim_${quest.id}`).setLabel('Claim').setStyle('PRIMARY')
        const unClaimButton = new MessageButton().setCustomId(`unclaim_${quest.id}`).setLabel('Unclaim').setStyle('PRIMARY');
        const submitForReviewButton = new MessageButton().setCustomId(`submit_${quest.id}`).setLabel('Submit for Review').setStyle('PRIMARY');

        const unclaimButtonNeeded = quest.applicants?.length >=1;
        switch(quest.status) {
          case 'OPEN':
            return new MessageActionRow().addComponents(unclaimButtonNeeded ? [claimButton, unClaimButton]: [claimButton]);
            break;
          case 'CLAIMED':
            return new MessageActionRow().addComponents(unclaimButtonNeeded ? [unClaimButton, submitForReviewButton]: [submitForReviewButton]);
            break;
          default:
            return null as unknown as MessageActionRow;
        }
      }

      createAnnouncementEmbed(q: Quest): MessageEmbed {
        const announcementEmbed = new MessageEmbed()
          .setTitle(`🦑 ${q.title} 🦑`)
          .setDescription(`${q.description}`)
          .addField('ID', `${q.id}`, true)
          .addField('Valid until', `${q.expiresOn}`, true)
          .addField('Max applicants', `${q.maxApplicants}`, true)
          .addField('Reward', `${q.rewards}`, true)
          .addField('Status', `${q.status}`, true)
          .setTimestamp();

        if(q.applicants?.length as number > 0) {
          announcementEmbed.addField('Applicants', `${q.applicants?.map((applicant) => 
            `📁 **${applicant.get().discordHandle}**`).join('\n')}`)
        }
        return announcementEmbed;
      }
}

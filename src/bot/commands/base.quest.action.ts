import { DiscordClientProvider } from "@discord-nestjs/core";
import { CommandInteraction, GuildMemberRoleManager, TextChannel } from "discord.js";
import { QuestsService } from "src/quests/quests.service";
import { botConfig } from '../../config';
import { BotEmbeds } from "../bot.embeds";

export class BaseQuestCommand {

  constructor(
    protected readonly questsService: QuestsService,
    private readonly discordProvider: DiscordClientProvider) {}

  async updateQuestAnnnouncement(questId: number, interaction: CommandInteraction) {
      const quest = await this.questsService.findOne(questId);
      const channel = this.discordProvider.getClient().channels.cache.find(c => c.id === botConfig.announceChannel);
      if(channel) {
        const message = await (channel as TextChannel).messages.fetch(quest?.get().announcementMessageId as string);
        await message?.edit(new BotEmbeds().prepareQuestAnnounce(quest?.get()));
        interaction.reply({content: 'Ok', ephemeral: true});
      } else {
        interaction.reply({
          content: "Channel not found",
          ephemeral: true
        })
      }
  }

  rejectNonAdmins(interaction: CommandInteraction): boolean {
    if (!(interaction.member.roles as GuildMemberRoleManager).cache.some(role => Object.values(botConfig.adminRoles).includes(role.name))) {
      interaction.reply({
        content: "Forbidden",
        ephemeral: true
      })
      return true;
    }
    return false;
  }
}

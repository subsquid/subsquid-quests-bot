import { DiscordClientProvider } from "@discord-nestjs/core";
import { Logger } from "@nestjs/common";
import { CommandInteraction, GuildMemberRoleManager, TextChannel } from "discord.js";
import { Quest } from "src/db/quest.entity";
import { QuestsService } from "src/quests/quests.service";
import { botConfig } from '../../config';
import { BotEmbeds } from "../bot.embeds";

export class BaseQuestCommand {
  private readonly logger = new Logger(BaseQuestCommand.name);

  constructor(
    protected readonly questsService: QuestsService,
    private readonly discordProvider: DiscordClientProvider) { }

  async updateQuestAnnnouncement(questId: number, interaction: CommandInteraction): Promise<Quest | null> {
    const quest = await this.questsService.findOne(questId);
    const channel = this.discordProvider.getClient().channels.cache.find(c => c.id === botConfig.announceChannel);
    if (channel) {
      const message = await (channel as TextChannel).messages.fetch(quest?.get().announcementMessageId as string);
      await message?.edit(new BotEmbeds().prepareQuestAnnounce(quest?.get()));
      interaction.reply({ content: 'Ok', ephemeral: true });
      return quest?.get();
    } else {
      interaction.reply({
        content: "Channel not found",
        ephemeral: true
      })
      return null;
    }
  }

  async pingApplicants(quest: Quest | null, interaction: CommandInteraction, action: string) {
    if (!quest) { return }
    quest.applicants.forEach(async a => {
      const user = await this.discordProvider.getClient().users.fetch(a.get().discordId);
      if (user) {
        this.logger.debug(`Notifying ${user.username}`);
        user.send({ content: `Your work on quest ${quest.title} was ${action}` });
      }
    });
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

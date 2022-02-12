import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import { CommandInteraction, GuildMember, GuildMemberRoleManager, InteractionReplyOptions } from 'discord.js';
import { Quest } from 'src/db/quest.entity';
import { QuestsService } from 'src/quests/quests.service';
import { QuestDto } from './createquest.dto';

@Command({
  name: 'createquest',
  description: 'Creates a new Quest',
})
@UsePipes(TransformPipe)
export class CreateQuestCommand implements DiscordTransformedCommand<QuestDto> {

  constructor(private readonly questsService: QuestsService) {}

  async handler(@Payload() dto: QuestDto, interaction: CommandInteraction): Promise<InteractionReplyOptions> {

    const serverUser = interaction.member as GuildMember;
    if (!(interaction.member.roles as GuildMemberRoleManager).cache.some(role => role.name === 'Admin')) {
      try {
        await serverUser.send("Forbidden");
        return {content: '!!!!!!!'};
      } catch (e) {
        return {
          content: "Forbidden",
          ephemeral: true
        }
      }
    }

    try {
      console.log(dto.quest);
      this.questsService.saveQuest({title: '111', description: '', status: 'OPEN', rewards: '', maxApplicants: 1, expiresOn: new Date()} as Quest)
      return {content: '+++++++++++++++++++++++++++'};
    } catch (e) {
      return {
        content: "I can't send you a direct message! Please enable DMs from users on this server",
        ephemeral: true
      }
    }
  }
}
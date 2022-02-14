import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import { 
  CommandInteraction, 
  GuildMember, 
  GuildMemberRoleManager, 
  InteractionReplyOptions 
} from 'discord.js';
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
      const quest = JSON.parse(dto.quest) as Quest
      quest.status = 'OPEN';
      this.questsService.saveQuest(quest);
      return {content: '+++++++++++++++++++++++++++'};
    } catch (e) {
      return {
        content: "Oops, I have difficult time processing your request. Maybe try again later?",
        ephemeral: true
      }
    }
  }
}
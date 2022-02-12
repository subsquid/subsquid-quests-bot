import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import { CommandInteraction, GuildMember, GuildMemberRoleManager, InteractionReplyOptions } from 'discord.js';
import { QuestDto } from './createquest.dto';

@Command({
  name: 'createquest',
  description: 'Creates a new Quest',
})
@UsePipes(TransformPipe)
export class CreateQuestCommand implements DiscordTransformedCommand<QuestDto> {

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
      return {content: '+++++++++++++++++++++++++++'};
    } catch (e) {
      return {
        content: "I can't send you a direct message! Please enable DMs from users on this server",
        ephemeral: true
      }
    }
  }
}
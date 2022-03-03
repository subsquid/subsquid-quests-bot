import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordTransformedCommand,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import { 
  CommandInteraction, 
  GuildMemberRoleManager, 
} from 'discord.js';
import { Quest } from 'src/db/quest.entity';
import { QuestsService } from 'src/quests/quests.service';
import { QuestDto } from './createquest.dto';
import { botConfig } from '../../config';

@Command({
  name: 'createquest',
  description: 'Creates a new Quest',
})
@UsePipes(TransformPipe)
export class CreateQuestCommand implements DiscordTransformedCommand<QuestDto> {

  constructor(private readonly questsService: QuestsService) {}

  async handler(@Payload() dto: QuestDto, interaction: CommandInteraction) {

    if (!(interaction.member.roles as GuildMemberRoleManager).cache.some(role => Object.values(botConfig.adminRoles).includes(role.name))) {
      console.log('role mismatch', (interaction.member.roles as GuildMemberRoleManager).cache.map(r => r.name), botConfig.adminRoles)

      interaction.reply({
        content: "Forbidden",
        ephemeral: true
      })
    } else {
      const quest = JSON.parse(dto.quest) as Quest
      quest.status = 'OPEN';
      this.questsService.saveQuest(quest);
      interaction.reply({
        content: ".",
        ephemeral: true
      })  
    }
  }
}
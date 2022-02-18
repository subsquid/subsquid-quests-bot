import { TransformPipe } from '@discord-nestjs/common';
import {
  Command,
  DiscordClientProvider,
  DiscordTransformedCommand,
  Payload,
  UsePipes,
} from '@discord-nestjs/core';
import {
  CommandInteraction,
} from 'discord.js';
import { QuestsService } from 'src/quests/quests.service';
import { BaseQuestCommand } from './base.quest.action';
import { QuestActionDto } from './quest.action.dto';

@Command({
  name: 'approve',
  description: 'Approves a Quest submission',
})
@UsePipes(TransformPipe)
export class ApproveQuestCommand extends BaseQuestCommand implements DiscordTransformedCommand<QuestActionDto> {

  constructor(
    questsService: QuestsService,
    discordProvider: DiscordClientProvider
  ) {
    super(questsService, discordProvider);
  }

  async handler(@Payload() dto: QuestActionDto, interaction: CommandInteraction) {

    if (!super.rejectNonAdmins(interaction)) {
      this.questsService.approveQuest(+dto.questid)
        .then(res => super.updateQuestAnnnouncement(+dto.questid, interaction))
        .then(quest => super.pingApplicants(quest, interaction, 'approved'));
    }
  }
}
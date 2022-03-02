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
import { UnclaimDto } from './unclaim.dto';

@Command({
  name: 'unclaim',
  description: 'Unclaims Quest',
})
@UsePipes(TransformPipe)
export class AdminUnclaimQuestCommand extends BaseQuestCommand implements DiscordTransformedCommand<UnclaimDto> {

  constructor(
    questsService: QuestsService,
    discordProvider: DiscordClientProvider
  ) {
    super(questsService, discordProvider);
  }

  async handler(@Payload() dto: UnclaimDto, interaction: CommandInteraction) {

    if (!super.rejectNonAdmins(interaction)) {
      this.questsService.unclaimQuestAdmin(+dto.questid, dto.claimer)
        .then(res => super.updateQuestAnnnouncement(+dto.questid, interaction))
    }
  }
}
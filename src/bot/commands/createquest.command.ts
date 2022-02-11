import {
  Command,
  DiscordCommand,
} from '@discord-nestjs/core';
import { CommandInteraction, GuildMemberRoleManager, InteractionReplyOptions } from 'discord.js';

@Command({
  name: 'createquest',
  description: 'Creates a new Quest',
})
export class CreateQuestCommand implements DiscordCommand {
    
  handler(interaction: CommandInteraction): InteractionReplyOptions {
    if(!(interaction.member.roles as GuildMemberRoleManager).cache.some(role => role.name === 'Admin')) {
      return {
        content: "Forbidden",
        ephemeral: true
      }
    }
    return {
      content: "OK",
      ephemeral: true
    }
  }
}
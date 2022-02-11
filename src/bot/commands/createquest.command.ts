import {
  Command,
  DiscordCommand,
} from '@discord-nestjs/core';
import { CommandInteraction, GuildMember, GuildMemberRoleManager } from 'discord.js';

@Command({
  name: 'createquest',
  description: 'Creates a new Quest',
})
export class CreateQuestCommand implements DiscordCommand {
    
  handler(interaction: CommandInteraction): void {

    const serverUser = interaction.member as GuildMember;
    if(!(interaction.member.roles as GuildMemberRoleManager).cache.some(role => role.name === 'Admin')) {
      serverUser.send("Forbidden");
    }
    serverUser.send("OK");
    
  }
}
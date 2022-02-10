import {
  Command,
  DiscordCommand,
} from '@discord-nestjs/core';
import { CommandInteraction } from 'discord.js';

@Command({
  name: 'createquest',
  description: 'Creates a new Quest',
})
export class CreateQuestCommand implements DiscordCommand {
    
  handler(interaction: CommandInteraction): string {
    console.log('Interaction', interaction);

    return 'Nice.';
  }
}
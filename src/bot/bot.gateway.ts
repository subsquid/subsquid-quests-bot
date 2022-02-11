import { Injectable, Logger } from '@nestjs/common';
import { Once, DiscordClientProvider } from '@discord-nestjs/core';

@Injectable()
export class BotGateway {
  private readonly logger = new Logger(BotGateway.name);

  constructor(private readonly discordProvider: DiscordClientProvider) {}

  @Once('ready')
  onReady(): void {
    this.logger.log(
      `Logged in as ${this.discordProvider.getClient()?.user?.tag}!`,
    );
  }
}
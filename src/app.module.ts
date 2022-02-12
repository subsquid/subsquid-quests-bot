import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';

@Module({
  imports: [ConfigModule.forRoot(), BotModule, DatabaseModule]
})
export class AppModule {}

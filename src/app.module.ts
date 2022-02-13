import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './db/database.module';
import { QuestsModule } from './quests/quests.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    BotModule,
    DatabaseModule,
    QuestsModule
  ]
})
export class AppModule {}

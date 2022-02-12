import { Module } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { questsProviders } from './quests.providers';
import { DatabaseModule } from '../db/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    QuestsService,  
    ...questsProviders,
  ],
  exports: [ QuestsService ]
})
export class QuestsModule {}
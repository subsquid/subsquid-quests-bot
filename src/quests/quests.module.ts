import { Module } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { questsProviders } from './quests.providers';
import { DatabaseModule } from '../db/database.module';
import { ApplicantsModule } from 'src/applicants/applicants.module';

@Module({
  imports: [DatabaseModule, ApplicantsModule],
  providers: [
    QuestsService,  
    ...questsProviders,
  ],
  exports: [ QuestsService ]
})
export class QuestsModule {}
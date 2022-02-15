import { Module } from '@nestjs/common';
import { ApplicantsService } from './applicants.service';
import { applicantsProviders } from './applicants.providers';
import { DatabaseModule } from '../db/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [
    ApplicantsService,  
    ...applicantsProviders,
  ],
  exports: [ ApplicantsService ]
})
export class ApplicantsModule {}
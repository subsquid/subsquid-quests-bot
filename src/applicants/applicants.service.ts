import { Injectable, Inject } from '@nestjs/common';
import { Applicant } from 'src/db/applicant.entity';

@Injectable()
export class ApplicantsService {

  constructor(
    @Inject('APPLICANTS_REPOSITORY')
    private readonly applicantsRepository: typeof Applicant
  ) {}

  async findOrCreateApplicant(applicant: Applicant): Promise<Applicant> { 
      return (await this.applicantsRepository.findOrCreate({where: {discordHandle: applicant.discordHandle}, defaults: {...applicant}}))[0]; 
  }

  async findApplicant(applicant: Applicant): Promise<Applicant | null> { 
    return await this.applicantsRepository.findOne({where: {discordHandle: applicant.discordHandle}}); 
  }
}
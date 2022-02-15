import { Injectable, Inject } from '@nestjs/common';
import { Applicant } from 'src/db/applicant.entity';

@Injectable()
export class ApplicantsService {

  constructor(
    @Inject('APPLICANTS_REPOSITORY')
    private readonly applicantsRepository: typeof Applicant
  ) {}

  async saveApplicant(applicant: Applicant): Promise<[number, Applicant[]] | Applicant> { //upsert didn't work here. Why?
    if(applicant.id) { 
      return this.applicantsRepository.update({...applicant}, {where: {id: applicant.id}});
    } else {
      return this.applicantsRepository.create({...applicant});
    }
  }

}
import { Applicant } from '../db/applicant.entity';

export const applicantsProviders = [
  {
    provide: 'APPLICANTS_REPOSITORY',
    useValue: Applicant,
  },
];
import { Applicant } from './applicant.entity';

export const applicantsProviders = [
  {
    provide: 'APPLICANTS_REPOSITORY',
    useValue: Applicant,
  },
];
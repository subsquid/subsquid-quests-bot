import { Quest } from '../db/quest.entity';

export const questsProviders = [
  {
    provide: 'QUESTS_REPOSITORY',
    useValue: Quest,
  },
];
import { Injectable, Inject } from '@nestjs/common';
import { Quest } from '../db/quest.entity';

@Injectable()
export class QuestsService {
  constructor(
    @Inject('QUESTS_REPOSITORY')
    private questsRepository: typeof Quest
  ) {}

  async saveQuest(quest: Quest): Promise<void> {
    this.questsRepository.create<Quest>({...quest});
  }
}
import { Injectable, Inject } from '@nestjs/common';
import { Quest } from '../db/quest.entity';

@Injectable()
export class QuestsService {

  constructor(
    @Inject('QUESTS_REPOSITORY')
    private readonly questsRepository: typeof Quest
  ) {}

  async saveQuest(quest: Quest): Promise<void> { //upsert didn't work here. Why?
    if(quest.id) { 
      this.questsRepository.update({...quest}, {where: {id: quest.id}});
    } else {
      this.questsRepository.create({...quest});
    }
  }

  findQuestsToAnnounce(): Promise<Quest[]> {
    return this.questsRepository.findAll({where: {announcementMessageId: null}});
  }
}
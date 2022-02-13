import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Quest } from '../db/quest.entity';
// import { botConfig } from '../config';

@Injectable()
export class QuestsService {

  private readonly logger = new Logger(QuestsService.name);

  constructor(
    @Inject('QUESTS_REPOSITORY')
    private questsRepository: typeof Quest
  ) {}

  async saveQuest(quest: Quest): Promise<void> {
    this.questsRepository.create<Quest>({...quest});
  }

  @Cron(CronExpression.EVERY_30_SECONDS, {
    name: 'notifications',
    timeZone: 'Europe/Paris',
  })
  async announceNewQuests(): Promise<void> {
    
    this.logger.debug('Checking for quests that need to be announced...');
    this.questsRepository.findAll<Quest>({where: {announcementMessageId: null}})
      .then((quests: Quest[]) => {
        this.logger.debug(`Announcing ${quests.length} new quests...`);
      })
  }
}
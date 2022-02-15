import { Injectable, Inject, Logger } from '@nestjs/common';
import { Op } from 'sequelize';
import { ApplicantsService } from 'src/applicants/applicants.service';
import { Applicant } from 'src/db/applicant.entity';
import { Quest } from '../db/quest.entity';

@Injectable()
export class QuestsService {
  private readonly logger = new Logger(QuestsService.name);

  constructor(
    @Inject('QUESTS_REPOSITORY')
    private readonly questsRepository: typeof Quest,
    private readonly applicantsService: ApplicantsService,

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

  async claimQuest(questId: number, discordUser: string): Promise<boolean> {

    let quest = await this.questsRepository.findByPk(questId, {include: {model: Applicant, required: false}}) as Quest;
    let questParsed = JSON.parse(JSON.stringify(quest)); // TODO how to avoid this???
    if(questParsed.status !== 'OPEN') return false;
    const currentApplicants = (await quest.$get('applicants'))?.map<string>(a => JSON.parse(JSON.stringify(a)).discordHandle);
    if(currentApplicants && currentApplicants.length < questParsed.maxApplicants && !currentApplicants.includes(discordUser)) {
      const applicant = await this.applicantsService.saveApplicant({discordHandle: discordUser} as Applicant) as Applicant;
      await quest.$add<Applicant>('applicants', applicant);
      quest.$count('applicants').then( async cnt => {
        if(cnt >= questParsed.maxApplicants) {
          questParsed.status = 'CLAIMED';
          await this.saveQuest(questParsed);
        }
      })
      this.logger.log(`${discordUser} claimed the quest ${questParsed.title}`);
      return true;
    } else {
      this.logger.log(`${discordUser} attempted to claim the quest ${questParsed.title} already claimed by them`);
      return false;
    }
  }

  //unused 
  findCurrentQuestsAnnounced(): Promise<Quest[]> {
    return this.questsRepository.findAll({
      where: {
          status: {[Op.in]: ['OPEN', 'INREVIEW']},
          announcementMessageId: {[Op.ne]: null}}
    });
  }
}
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

  async claimQuest(questId: number, discordUser: string) {

    const quest = await this.questsRepository.findByPk(questId, {include: {model: Applicant, required: false}}) as Quest;
    if(!quest.applicants) {
      console.log('111')
      quest.applicants = [{discordHandle: discordUser} as Applicant]
      await this.saveQuest(quest);
    } else {
      const currentApplicants = quest?.applicants?.map<string>(a => a.discordHandle);
      this.logger.debug(quest?.applicants.length);
      if(!quest?.applicants || (currentApplicants && !currentApplicants.includes(discordUser))) {
        // quest?.applicants?.push({discordHandle: discordUser} as Applicant);
        const applicant = await this.applicantsService.saveApplicant({discordHandle: discordUser} as Applicant) as Applicant;
        quest.$add<Applicant>('applicants', applicant)
        this.logger.debug(quest?.applicants.length);
        await this.saveQuest(quest);
      }  
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
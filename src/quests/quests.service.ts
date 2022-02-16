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
      await this.questsRepository.update({...quest}, {where: {id: quest.id}});
    } else {
      await this.questsRepository.create({...quest});
    }
  }

  findQuestsToAnnounce(): Promise<Quest[]> {
    return this.questsRepository.findAll({where: {announcementMessageId: null}});
  }

  async findOne(questId: number): Promise<Quest | null> {
    return this.questsRepository.findByPk(questId, {include: {model: Applicant, required: false}});
  }

  async claimQuest(questId: number, discordUser: string): Promise<boolean> {
    return await this.questsRepository.sequelize?.transaction( async (tx) => {
      let quest = await this.findOne(questId) as Quest;
      let questRaw: Quest = quest.get();
      if(questRaw.status !== 'OPEN') return false;
      const currentApplicants = questRaw.applicants?.map<string>(a => JSON.parse(JSON.stringify(a)).discordHandle);
      if(currentApplicants && currentApplicants.length < questRaw.maxApplicants && !currentApplicants.includes(discordUser)) {
        const applicant = await this.applicantsService.saveApplicant({discordHandle: discordUser} as Applicant) as Applicant;
        await quest.$add<Applicant>('applicants', applicant);
        const applicantCount = await quest.$count('applicants')
        if(applicantCount >= questRaw.maxApplicants) {
          questRaw.status = 'CLAIMED';
          await this.saveQuest(questRaw);
        }
        this.logger.log(`${discordUser} claimed the quest ${questRaw.title}`);
        return true;
      } else {
        this.logger.log(`${discordUser} attempted to claim the quest ${questRaw.title} already claimed by them`);
        return false;
      }  
    }) as boolean;
  }

  async submitQuestForReview(questId: number, discordUser: string): Promise<boolean> {
    let quest: Quest = (await this.findOne(questId) as Quest).get();
    if(quest.assignee !== discordUser) return false;
    quest.status = 'INREVIEW';
    await this.saveQuest(quest);
    this.logger.log(`${discordUser} submitted the quest '${quest.title}' for review`);
    return true;
  }

  async approveQuest(questId: number): Promise<boolean> {
    let quest: Quest = (await this.findOne(questId) as Quest).get();
    quest.status = 'CLOSED';
    await this.saveQuest(quest);
    this.logger.log(`Quest '${quest.title}' has been approved`);
    return true;
  }

  async rejectQuest(questId: number): Promise<boolean> {
    let quest: Quest = (await this.findOne(questId) as Quest).get();
    quest.status = 'CLAIMED';
    await this.saveQuest(quest);
    this.logger.log(`Quest '${quest.title}' has been rejected`);
    return true;
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
import { Injectable, Inject, Logger } from '@nestjs/common';
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
      if(questRaw.status !== 'OPEN') {
        this.logger.warn(`Claim not possible for quest in ${questRaw.status} state`);
        return false;
      }
      const currentApplicants = questRaw.applicants?.map<string>(a => a.get().discordHandle);
      if(currentApplicants && currentApplicants.length < questRaw.maxApplicants && !currentApplicants.includes(discordUser)) {
        const applicant = await this.applicantsService.findOrCreateApplicant({discordHandle: discordUser} as Applicant);
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

  async unclaimQuest(questId: number, discordUser: string, isAdmin: boolean): Promise<boolean> {
    return await this.questsRepository.sequelize?.transaction( async (tx) => {
      let quest = await this.findOne(questId) as Quest;
      let questRaw: Quest = quest.get();
      if( !Object.values(['OPEN', 'CLAIMED']).includes(questRaw.status) ) {
        this.logger.warn(`Unclaim not possible for quest in ${questRaw.status} state`);
        return false;
      }
      const currentApplicants = questRaw.applicants?.map<string>(a => a.get().discordHandle);
      if(isAdmin && currentApplicants?.length === 1 && questRaw.maxApplicants === 1) {
        this.logger.warn(`Unclaiming by admin`);
        await quest.$remove<Applicant>('applicants', questRaw.applicants[0]);
        questRaw.status = 'OPEN';
        await this.saveQuest(questRaw);
        return true;
      } else {
        if(currentApplicants && currentApplicants.includes(discordUser)) {
          const applicant = await this.applicantsService.findApplicant({discordHandle: discordUser} as Applicant) as Applicant;
          await quest.$remove<Applicant>('applicants', applicant);
          questRaw.status = 'OPEN';
          await this.saveQuest(questRaw);
          this.logger.log(`${discordUser} unclaimed the quest ${questRaw.title}`);
          return true;
        } else {
          this.logger.log(`${discordUser} attempted to unclaim the quest ${questRaw.title}`);
          return false;
        }  
      }
    }) as boolean;
  }
  
  async submitQuestForReview(questId: number, discordUser: string): Promise<boolean> {
    let quest = (await this.findOne(questId) as Quest);
    let questRaw: Quest = quest.get();
    const currentApplicants = questRaw.applicants?.map<string>(a => JSON.parse(JSON.stringify(a)).discordHandle);
    if(questRaw.status === 'INREVIEW' || currentApplicants && !currentApplicants.includes(discordUser)) {
      return false;
    }
    questRaw.status = 'INREVIEW';
    await this.saveQuest(questRaw);
    this.logger.log(`${discordUser} submitted the quest '${questRaw.title}' for review`);
    return true;
  }

  async approveQuest(questId: number): Promise<boolean> {
    return await this.questsRepository.sequelize?.transaction( async (tx) => {
      let quest = (await this.findOne(questId) as Quest);
      let questRaw: Quest = quest.get();
      questRaw.status = 'CLOSED';
      await this.saveQuest(questRaw);
      this.logger.log(`Quest '${questRaw.title}' has been approved`);
      return true;
    }) as boolean;
  }

  async rejectQuest(questId: number): Promise<boolean> {
    return await this.questsRepository.sequelize?.transaction( async (tx) => {
      let quest = (await this.findOne(questId) as Quest);
      let questRaw: Quest = quest.get();
      questRaw.status = 'CLAIMED';
      await this.saveQuest(questRaw);
      this.logger.log(`Quest '${questRaw.title}' has been rejected`);
      return true;
    }) as boolean;
  }
}
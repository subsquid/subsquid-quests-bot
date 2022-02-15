import { BelongsToMany, DataType, Default, Min, Model } from 'sequelize-typescript'
import { Column, IsDate, Table } from 'sequelize-typescript'
import { Applicant } from './applicant.entity'

@Table
export class Quest extends Model {

  @Column
  title!: string

  @Column(DataType.TEXT)
  description!: string

  @Column(DataType.ENUM('OPEN','CLAIMED','INREVIEW','CLOSED'))
  status!: string

  @Column
  rewards!: string

  @Column
  assignee?: string

  @Column
  announcementMessageId?: string //ID of Discord message where this quest was announced. Filled when the Bot announces the Quest

  @Min(1)
  @Default(1)
  @Column
  maxApplicants!: number

  @IsDate
  @Column
  expiresOn!: Date

  @BelongsToMany(() => Applicant, {through: 'quests_applicants', foreignKey: 'applicant_id', otherKey: 'quest_id'})
  applicants?: Applicant[] = []

}
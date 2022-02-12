import { BelongsToMany, Column, Model, Table } from 'sequelize-typescript'
import { Quest } from './quest'

@Table
export class Applicant extends Model {
  
  @Column
  discordHandle!: string

  @BelongsToMany(() => Quest, {through: 'quests_applicants', foreignKey: 'applicant_id', otherKey: 'quest_id'})
  quests!: Quest[]
}
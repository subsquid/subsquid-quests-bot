import db from '../db'
import { DataTypes, Op, Model } from 'sequelize'

class Quest extends Model {}

Quest.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
  title: {type: DataTypes.STRING, allowNull: false},
  description: DataTypes.STRING,
  rewards: DataTypes.STRING,
  status: DataTypes.ENUM('OPEN','CLAIMED','INREVIEW','CLOSED'),
  blocktime: DataTypes.BIGINT,
  assignee: DataTypes.STRING,
  maxApplicants: DataTypes.INTEGER,
  expiresOn: {type: DataTypes.DATE, allowNull: false},
}, {modelName: 'quest', sequelize: db})

export default Quest

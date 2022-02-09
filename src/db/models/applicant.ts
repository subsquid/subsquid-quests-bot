import db from '../db'
import { DataTypes, Op, Model } from 'sequelize'

class Applicant extends Model {}

Applicant.init({
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
  discordHandle: {type: DataTypes.STRING, allowNull: false},
}, {modelName: 'applicant', sequelize: db})

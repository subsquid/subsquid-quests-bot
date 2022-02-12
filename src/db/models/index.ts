import {Quest} from './quest';
import {Applicant} from './applicant';

// Quest.belongsToMany(Applicant, {through: 'quests_applicants'});
// Applicant.belongsToMany(Quest, {through: 'quests_applicants'});

export default {
    Quest,
    Applicant
}
import { Param } from '@discord-nestjs/core';


export class QuestActionDto {
  @Param({ description: 'Quest ID', required: true})
    questid!: string;
}
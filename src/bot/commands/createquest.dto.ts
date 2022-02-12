import { Param } from '@discord-nestjs/core';


export class QuestDto {
  @Param({ description: 'Quest data in JSON format', required: true })
    quest!: string;
}
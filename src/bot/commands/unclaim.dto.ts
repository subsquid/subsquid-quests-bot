import { Param } from '@discord-nestjs/core';


export class UnclaimDto {
  @Param({ description: 'Quest ID', required: true})
    claimer!: string;
  @Param({ description: 'Claimer handle (john#1234)', required: true})
    questid!: string;

}
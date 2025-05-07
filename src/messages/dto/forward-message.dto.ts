import { IsNotEmpty } from 'class-validator';

export class ForwardMessageDto {
  @IsNotEmpty()
  chatId: number;
}

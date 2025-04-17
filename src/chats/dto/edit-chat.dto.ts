import { IsNotEmpty, IsString } from 'class-validator';

export class EditChatDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class EditMessageDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}

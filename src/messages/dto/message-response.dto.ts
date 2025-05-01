import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsString,
} from 'class-validator';
import { IsNull } from '@shared/validators/is-null.validator';

export class MessageResponseDto {
  @IsInt()
  id: number;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsInt()
  chatId: number;

  @IsInt()
  creatorId: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsOptional()
  @IsInt()
  @IsNull()
  repliedMessageId: number | null;

  @IsOptional()
  @IsInt()
  forwardedChatId: number | null;

  @IsOptional()
  @IsInt()
  forwardedFromUserId: number | null;

  @IsInt()
  status: number;
}

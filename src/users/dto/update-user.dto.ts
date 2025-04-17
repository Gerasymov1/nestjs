import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsStrongPassword,
} from 'class-validator';
import { AtLeastOneField } from '@shared/validators/at-least-one-field.validator';

@AtLeastOneField(['firstName', 'lastName', 'password'])
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsStrongPassword(
    {
      minLength: 8,
      minUppercase: 1,
    },
    {
      message:
        'Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character',
    },
  )
  password?: string;
}

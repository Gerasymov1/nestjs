import { IsString, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

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
  password: string;
}

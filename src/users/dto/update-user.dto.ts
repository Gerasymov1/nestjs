import { IsString, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsStrongPassword({
    minLength: 8,
  })
  password: string;
}

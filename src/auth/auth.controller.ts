import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '@shared/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      return {
        statusCode: 401,
        message: 'Invalid credentials',
      };
    }

    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);

    if (!user) {
      return {
        statusCode: 409,
        message: 'User already exists',
      };
    }

    return {
      statusCode: 201,
      message: 'User registered successfully',
      user,
    };
  }
}

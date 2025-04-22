import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '@shared/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (isValidPassword) {
      const { password, ...result } = user;

      return result as User;
    }
  }

  async login(loginDto: LoginDto): Promise<any> {
    const validatedUser = await this.validateUser({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (!validatedUser) throw new UnauthorizedException();

    const payload = {
      email: loginDto.email,
      sub: validatedUser.id,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: validatedUser,
    };
  }

  async register(user: CreateUserDto) {
    const hashedPassword = await this.usersService.hashPassword(user.password);

    const newUser = {
      ...user,
      password: hashedPassword,
    };

    return this.usersService.createUser(newUser);
  }
}

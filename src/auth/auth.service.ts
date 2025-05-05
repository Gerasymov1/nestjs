import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '@shared/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    loginDto: LoginDto,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      this.logger.error(`User not found during validation: ${loginDto.email}`);
      return null;
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (isValidPassword) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      this.logger.debug(`User validated successfully: ${loginDto.email}`);
      return result;
    }

    this.logger.error(`Invalid password for user: ${loginDto.email}`);
    return null;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const validatedUser = await this.validateUser({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (!validatedUser) {
      this.logger.error(`Login failed for user: ${loginDto.email}`);
      throw new UnauthorizedException();
    }

    const payload = {
      email: loginDto.email,
      sub: validatedUser.id,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    this.logger.log(`User logged in successfully: ${loginDto.email}`);
    return {
      accessToken,
      refreshToken,
      user: validatedUser,
    };
  }

  async register(user: CreateUserDto): Promise<Omit<User, 'password'>> {
    this.logger.log(`Registering new user: ${user.email}`);
    const hashedPassword = await this.usersService.hashPassword(user.password);

    const newUser = {
      ...user,
      password: hashedPassword,
    };

    const createdUser = await this.usersService.createUser(newUser);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = createdUser;
    this.logger.log(`User registered successfully: ${user.email}`);
    return result;
  }
}

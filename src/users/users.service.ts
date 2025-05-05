import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from '@shared/dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const searchedUser = await this.userRepository.findOne({
        where: {
          email: createUserDto.email,
        },
      });

      if (searchedUser) {
        this.logger.error(
          `User already exists with email: ${createUserDto.email}`,
        );

        throw new ConflictException('User already exists');
      }

      const newUser = this.userRepository.create(createUserDto);
      return this.userRepository.save(newUser);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error creating user: email=${createUserDto.email}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id,
        },
      });

      if (!user) {
        this.logger.error(`User not found with ID: ${id}`);

        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const updatedUser = this.userRepository.merge(user, updateUserDto);
      return this.userRepository.save(updatedUser);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`Error updating user: id=${id}, error=${errorMessage}`);

      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        this.logger.error(`User not found with email: ${email}`);

        throw new NotFoundException(`User with email ${email} not found`);
      }

      return user;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error finding user by email: email=${email}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id,
        },
      });

      if (!user) {
        this.logger.error(`User not found with ID: ${id}`);

        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return user;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error finding user by ID: id=${id}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 10);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`Error hashing password: error=${errorMessage}`);

      throw error;
    }
  }
}

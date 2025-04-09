import {
  ConflictException,
  Injectable,
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
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const searchedUser = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (searchedUser) throw new ConflictException('User already exists');

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const user = {
      ...createUserDto,
      password: hashedPassword,
    };

    const newUser = this.userRepository.create(user);

    return this.userRepository.save(newUser);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    const updatedUser = this.userRepository.merge(user, updateUserDto);

    return this.userRepository.save(updatedUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);

    return user;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}

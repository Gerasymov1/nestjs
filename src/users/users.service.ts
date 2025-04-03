import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UsersRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
      },
    });

    if (user) throw new NotFoundException('User already exists');

    const newUser = this.userRepository.create(createUserDto);

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
}

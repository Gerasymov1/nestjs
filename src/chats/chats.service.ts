import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GetChatsDto } from './dto/get-chats.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat) private readonly chatsRepository: Repository<Chat>,
  ) {}

  async getChats(getChatsDto: GetChatsDto, creatorId: number): Promise<Chat[]> {
    const page = getChatsDto?.page || 1;
    const limit = getChatsDto?.limit || 10;
    const search = getChatsDto?.search || '';

    const offset = (page - 1) * limit;

    const searchPattern = `%${search}%`;

    return this.chatsRepository
      .createQueryBuilder('chat')
      .where('chat.creatorId = :creatorId', { creatorId })
      .andWhere('chat.title LIKE :search', { search: searchPattern })
      .orderBy('chat.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
  }

  async createChat(
    createChatDto: CreateChatDto,
    creatorId: number,
  ): Promise<Chat> {
    const newChat = this.chatsRepository.create({
      ...createChatDto,
      creatorId,
    });

    return this.chatsRepository.save(newChat);
  }
}

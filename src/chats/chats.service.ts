import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { CreateChatDto } from './dto/create-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { GetChatsDto } from './dto/get-chats.dto';
import { EditChatDto } from './dto/edit-chat.dto';

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

  async getChat(id: number, creatorId: number): Promise<Chat> {
    return await this.ensureUserOwnsChat(id, creatorId);
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

  async editChat(id: number, editChatDto: EditChatDto, creatorId: number) {
    const chat = await this.ensureUserOwnsChat(id, creatorId);

    this.chatsRepository.merge(chat, editChatDto);

    return this.chatsRepository.save(chat);
  }

  async deleteChat(id: number, creatorId: number) {
    await this.ensureUserOwnsChat(id, creatorId);

    await this.chatsRepository.delete(id);
  }

  private async ensureUserOwnsChat(id: number, creatorId: number) {
    const chat = await this.chatsRepository.findOne({ where: { id } });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.creatorId !== creatorId) {
      throw new ForbiddenException('You are not the creator of this chat');
    }

    return chat;
  }
}

import {
  ForbiddenException,
  Injectable,
  Logger,
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
  private readonly logger = new Logger(ChatsService.name);

  constructor(
    @InjectRepository(Chat) private readonly chatsRepository: Repository<Chat>,
  ) {}

  async getChats(getChatsDto: GetChatsDto, creatorId: number): Promise<Chat[]> {
    try {
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error getting chats: creatorId=${creatorId}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  async getChat(id: number, creatorId: number): Promise<Chat> {
    try {
      return await this.ensureUserOwnsChat(id, creatorId);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error getting chat: chatId=${id}, creatorId=${creatorId}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  async createChat(
    createChatDto: CreateChatDto,
    creatorId: number,
  ): Promise<Chat> {
    try {
      const newChat = this.chatsRepository.create({
        ...createChatDto,
        creatorId,
      });

      return this.chatsRepository.save(newChat);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error creating chat: creatorId=${creatorId}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  async editChat(id: number, editChatDto: EditChatDto, creatorId: number) {
    try {
      const chat = await this.ensureUserOwnsChat(id, creatorId);

      this.chatsRepository.merge(chat, editChatDto);

      return this.chatsRepository.save(chat);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error editing chat: chatId=${id}, creatorId=${creatorId}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  async deleteChat(id: number, creatorId: number) {
    try {
      await this.ensureUserOwnsChat(id, creatorId);

      await this.chatsRepository.delete(id);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error deleting chat: chatId=${id}, creatorId=${creatorId}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  private async ensureUserOwnsChat(id: number, creatorId: number) {
    try {
      const chat = await this.chatsRepository.findOne({ where: { id } });

      if (!chat) {
        this.logger.error(`Chat not found: chatId=${id}`);

        throw new NotFoundException('Chat not found');
      }

      if (chat.creatorId !== creatorId) {
        this.logger.error(
          `Unauthorized chat access: chatId=${id}, creatorId=${creatorId}`,
        );

        throw new ForbiddenException('You are not the creator of this chat');
      }

      return chat;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error in ensureUserOwnsChat: chatId=${id}, creatorId=${creatorId}, error=${errorMessage}`,
      );

      throw error;
    }
  }
}

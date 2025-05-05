import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Chat } from '../chats/entities/chat.entity';
import { User } from '../users/entities/user.entity';
import { GetMessagesByChatIdDto } from './dto/get-messages-by-chat-id.dto';
import { EditMessageDto } from './dto/edit-message.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  private async ensureUserOwnsMessage(
    id: number,
    creatorId: number,
  ): Promise<Message> {
    try {
      const message = await this.messagesRepository.findOne({
        where: { id, creatorId: { id: creatorId } },
      });

      if (!message) {
        this.logger.error(
          `Message access denied: messageId=${id}, creatorId=${creatorId}`,
        );

        throw new Error(
          'Message not found or you do not have permission to access it',
        );
      }

      return message;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error in ensureUserOwnsMessage: messageId=${id}, creatorId=${creatorId}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  async getMessagesByChatId(
    getMessagesByChatIdDto: GetMessagesByChatIdDto,
    chatId: number,
    creatorId?: number,
  ): Promise<Message[]> {
    try {
      const page = getMessagesByChatIdDto?.page || 1;
      const limit = getMessagesByChatIdDto?.limit || 10;
      const offset = (page - 1) * limit;

      const queryBuilder =
        this.messagesRepository.createQueryBuilder('message');

      queryBuilder.where('message.chatId = :chatId', { chatId });

      if (creatorId) {
        queryBuilder.andWhere('message.creatorId = :creatorId', { creatorId });
      }

      return queryBuilder
        .addSelect('message.creatorId')
        .orderBy('message.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getMany();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error getting messages: chatId=${chatId}, creatorId=${creatorId}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  async createMessage(
    createMessageDto: CreateMessageDto,
    chatId: number,
    creatorId: number,
  ): Promise<Message> {
    try {
      const newMessage = this.messagesRepository.create({
        ...createMessageDto,
        chatId: { id: chatId } as Chat,
        creatorId: { id: creatorId } as User,
      });

      return this.messagesRepository.save(newMessage);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error creating message: chatId=${chatId}, creatorId=${creatorId}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  async editMessage(
    id: number,
    editMessageDto: EditMessageDto,
    creatorId: number,
  ): Promise<Message> {
    try {
      const message = await this.ensureUserOwnsMessage(id, creatorId);

      this.messagesRepository.merge(message, editMessageDto);

      return this.messagesRepository.save(message);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error editing message: messageId=${id}, creatorId=${creatorId}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  async deleteMessage(id: number, creatorId: number): Promise<void> {
    try {
      const message = await this.ensureUserOwnsMessage(id, creatorId);

      await this.messagesRepository.delete(message.id);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error deleting message: messageId=${id}, creatorId=${creatorId}, error=${errorMessage}`,
      );

      throw error;
    }
  }

  async forwardMessage(
    id: number,
    chatId: number,
    creatorId: number,
  ): Promise<Message> {
    try {
      await this.ensureUserOwnsMessage(id, creatorId);

      const original = await this.messagesRepository.findOneOrFail({
        where: { id },
        relations: ['chatId', 'creatorId', 'repliedMessage'],
      });

      const newMessage = this.messagesRepository.create({
        text: original.text,
        chatId: chatId as unknown as Chat,
        creatorId: creatorId as unknown as User,
        repliedMessageId: original.id ?? null,
        forwardedFromUserId: original?.creatorId?.id ?? null,
        forwardedChatId: original?.chatId?.id ?? null,
      });

      return this.messagesRepository.save(newMessage);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(
        `Error forwarding message: messageId=${id}, targetChatId=${chatId}, creatorId=${creatorId}, error=${errorMessage}`,
      );

      throw error;
    }
  }
}

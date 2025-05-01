import { Injectable } from '@nestjs/common';
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
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  async ensureUserOwnsMessage(id: number, creatorId: number): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id, creatorId: { id: creatorId } },
    });

    if (!message) {
      throw new Error(
        'Message not found or you do not have permission to access it',
      );
    }

    return message;
  }

  async getMessagesByChatId(
    getMessagesByChatIdDto: GetMessagesByChatIdDto,
    chatId: number,
  ): Promise<Message[]> {
    const page = getMessagesByChatIdDto?.page || 1;
    const limit = getMessagesByChatIdDto?.limit || 10;
    const offset = (page - 1) * limit;

    return this.messagesRepository
      .createQueryBuilder('message')
      .where('message.chatId = :chatId', { chatId })
      .orderBy('message.createdAt', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
  }

  async createMessage(
    createMessageDto: CreateMessageDto,
    chatId: number,
    creatorId: number,
  ): Promise<Message> {
    const newMessage = this.messagesRepository.create({
      ...createMessageDto,
      chatId: { id: chatId } as Chat,
      creatorId: { id: creatorId } as User,
    });

    return this.messagesRepository.save(newMessage);
  }

  async editMessage(
    id: number,
    editMessageDto: EditMessageDto,
    creatorId: number,
  ): Promise<Message> {
    const message = await this.ensureUserOwnsMessage(id, creatorId);

    this.messagesRepository.merge(message, editMessageDto);

    return this.messagesRepository.save(message);
  }
}

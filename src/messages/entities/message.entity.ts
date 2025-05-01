import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Chat } from '../../chats/entities/chat.entity';
import { User } from '../../users/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  text: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  repliedMessageId: number;

  @Column({ default: 1 })
  status: number;

  @Column({ nullable: true })
  forwardedChatId: number;

  @Column({ nullable: true })
  forwardedFromUserId: number;

  @ManyToOne(() => Chat, (chat) => chat.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chatId: Chat;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creatorId: User;

  @ManyToOne(() => Message, (message) => message.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'repliedMessageId' })
  repliedMessage: Message;
}

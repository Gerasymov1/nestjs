import { MessageResponseDto } from '../../messages/dto/message-response.dto';
import { Message } from '../../messages/entities/message.entity';

export function toMessageResponse(message: Message): MessageResponseDto {
  return {
    id: message.id,
    text: message.text,
    chatId: message.chatId.id,
    creatorId: message.creatorId.id,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    repliedMessageId: message.repliedMessageId,
    forwardedChatId: message.forwardedChatId,
    forwardedFromUserId: message.forwardedFromUserId,
    status: message.status,
  };
}

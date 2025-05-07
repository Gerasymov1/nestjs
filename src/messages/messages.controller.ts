import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { getUserIdFromRequest } from '@shared/utils/get-user-id-from-request';
import { CreateMessageDto } from './dto/create-message.dto';
import { toMessageResponse } from '@shared/utils/to-message-response';
import { GetMessagesByChatIdDto } from './dto/get-messages-by-chat-id.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { ForwardMessageDto } from './dto/forward-message.dto';

@Controller('chats/:chatId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async getMessagesByChatId(
    @Query() query: GetMessagesByChatIdDto,
    @Param('chatId') chatId: number,
  ) {
    return this.messagesService.getMessagesByChatId(query, chatId);
  }

  @Post()
  async createMessage(
    @Req() req: Request,
    @Param('chatId') chatId: number,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const creatorId = getUserIdFromRequest(req);

    const message = await this.messagesService.createMessage(
      createMessageDto,
      chatId,
      creatorId,
    );

    return toMessageResponse(message);
  }

  @Patch('/:id')
  async editMessage(
    @Param('id') id: number,
    @Body() editMessageDto: EditMessageDto,
    @Req() req: Request,
  ) {
    const creatorId = getUserIdFromRequest(req);

    return this.messagesService.editMessage(id, editMessageDto, creatorId);
  }

  @Delete('/:id')
  async deleteMessage(@Param('id') id: number, @Req() req: Request) {
    const creatorId = getUserIdFromRequest(req);

    return this.messagesService.deleteMessage(id, creatorId);
  }

  @Post('/:id/forward')
  async forwardMessage(
    @Param('id') id: number,
    @Body() forwardMessageDto: ForwardMessageDto,
    @Req() req: Request,
  ) {
    const creatorId = getUserIdFromRequest(req);

    return this.messagesService.forwardMessage(
      id,
      forwardMessageDto.chatId,
      creatorId,
    );
  }
}

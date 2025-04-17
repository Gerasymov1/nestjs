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
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { GetChatsDto } from './dto/get-chats.dto';
import { getUserIdFromRequest } from '@shared/utils/get-user-id-from-request';
import { EditChatDto } from './dto/edit-chat.dto';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  async getChats(@Req() req: Request, @Query() query: GetChatsDto) {
    const creatorId = getUserIdFromRequest(req);

    return this.chatsService.getChats(
      {
        page: query?.page,
        limit: query?.limit,
        search: query?.search,
      },
      creatorId,
    );
  }

  @Get('/:id')
  async getChat(@Param('id') id: number, @Req() req: Request) {
    const getCreatorId = getUserIdFromRequest(req);

    return this.chatsService.getChat(id, getCreatorId);
  }

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto, @Req() req: Request) {
    const creatorId = getUserIdFromRequest(req);

    return this.chatsService.createChat(createChatDto, creatorId);
  }

  @Patch('/:id')
  async editChat(
    @Body() editChatDto: EditChatDto,
    @Param('id') id: number,
    @Req() req: Request,
  ) {
    const creatorId = getUserIdFromRequest(req);

    return this.chatsService.editChat(id, editChatDto, creatorId);
  }

  @Delete('/:id')
  async deleteChat(@Param('id') id: number, @Req() req: Request) {
    const creatorId = getUserIdFromRequest(req);

    return this.chatsService.deleteChat(id, creatorId);
  }
}

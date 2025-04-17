import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { GetChatsDto } from './dto/get-chats.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getChats(@Req() req: Request, @Query() query: GetChatsDto) {
    const creatorId = req.user?.id;

    if (!creatorId) {
      throw new UnauthorizedException('User is not authenticated');
    }

    return this.chatsService.getChats(
      {
        page: query?.page,
        limit: query?.limit,
        search: query?.search,
      },
      creatorId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createChat(@Body() createChatDto: CreateChatDto, @Req() req: Request) {
    const creatorId = req.user?.id;

    if (!creatorId) {
      throw new UnauthorizedException('User is not authenticated');
    }

    return this.chatsService.createChat(createChatDto, creatorId);
  }
}

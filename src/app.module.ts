import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import './types/express';

@Module({
  imports: [DatabaseModule, UsersModule, ChatsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

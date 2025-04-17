import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import * as process from 'node:process';
import { JwtStrategy } from './jwt.strategy';
import { ChatsModule } from '../chats/chats.module';

dotenv.config();

const { SECRET_KEY } = process.env;

@Module({
  imports: [
    UsersModule,
    ChatsModule,
    JwtModule.register({
      secret: SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}

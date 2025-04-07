import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import * as process from 'node:process';

dotenv.config();

const { DB_PORT, DB_NAME, DB_PASSWORD, DB_USER } = process.env;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      port: DB_PORT ? parseInt(DB_PORT) : 3306,
      username: DB_USER || 'root',
      password: DB_PASSWORD || '',
      database: DB_NAME || 'root',
      entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
      dropSchema: true,
      synchronize: false,
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      charset: 'utf8mb4_general_ci',
    }),
  ],
})
export class DatabaseModule {}

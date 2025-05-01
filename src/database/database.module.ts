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
      type: 'postgres',
      host: 'localhost',
      port: DB_PORT ? parseInt(DB_PORT) : 5432,
      username: DB_USER || 'postgres',
      password: DB_PASSWORD || '',
      database: DB_NAME || 'postgres',
      entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
      synchronize: false,
      migrationsRun: false,
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    }),
  ],
})
export class DatabaseModule {}

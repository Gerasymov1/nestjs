import { DataSource } from 'typeorm';
import * as process from 'node:process';

const { DB_PORT, DB_NAME, DB_PASSWORD, DB_USER, DB_HOST } = process.env;

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: DB_HOST || 'localhost',
        port: DB_PORT ? parseInt(DB_PORT) : 3306,
        username: DB_USER || 'root',
        password: DB_PASSWORD || '',
        database: DB_NAME || 'root',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];

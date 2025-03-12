import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(@Inject('DATA_SOURCE') private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
}

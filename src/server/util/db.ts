import { Module, OnModuleDestroy } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Connection, createConnection } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Admin } from '../admin/admin.entity';
import { School } from '../school/school.entity';
import { Seller } from '../seller/seller.entity';
import { SnakeNamingStrategy } from './snake-case';

const entities = [Seller, School, Admin];

export const connectionOptions: PostgresConnectionOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: entities,
  // migrations: ['./migration/**/*.ts'],
  // subscribers: ['./subscriber/**/*.ts'],
  logging: 'all',
  maxQueryExecutionTime: 300,
  extra: {
    ssl: true,
  },
  // cache: true,
  namingStrategy: new SnakeNamingStrategy(),
};

const connectionProvider = {
  provide: Connection,
  useFactory: () => createConnection(connectionOptions),
};

const repoProviders = entities.map(entity => {
  return {
    provide: entity,
    useFactory: (connection: Connection) => connection.getRepository(entity),
    inject: [Connection],
  };
});

const providers = [connectionProvider, ...repoProviders];

@Module({
  providers,
  exports: providers,
})
export class DBModule implements OnModuleDestroy {
  constructor(private readonly moduleRef: ModuleRef) {}

  async onModuleDestroy() {
    const connection = this.moduleRef.get(Connection);
    await connection.close();
  }
}

import { Connection, createConnection } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { Admin } from '../admin/admin.entity';
import { Listing } from '../listing/listing.entity';
import { School } from '../school/school.entity';
import { Seller } from '../seller/seller.entity';
import { SnakeNamingStrategy } from './snake-case';

const connectionOptions: PostgresConnectionOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Seller, School, Admin, Listing],
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

let connection: Connection;

export async function connect(): Promise<Connection> {
  if (!connection) {
    connection = await createConnection(connectionOptions);
  }

  if (process.env.DB_SYNC === 'true') {
    connection.synchronize();
  }

  return connection;
}
export async function close() {
  await connection.close();
}

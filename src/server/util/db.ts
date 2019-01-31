import {
  Connection,
  createConnection,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { SnakeNamingStrategy } from './snake-case';

export const PrimaryKey = () => PrimaryGeneratedColumn('uuid');
export const Created = () =>
  CreateDateColumn({
    type: 'timestamp with time zone',
  });
export const Updated = () =>
  UpdateDateColumn({
    type: 'timestamp with time zone',
  });

let connection: Connection | undefined;

export async function connect(entities: any[]): Promise<Connection> {
  if (!connection) {
    const connectionOptions: PostgresConnectionOptions = {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities,
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
    connection = await createConnection(connectionOptions);

    if (process.env.DB_SYNC === 'true') {
      await connection.synchronize();
    }
  }

  return connection;
}
export async function close() {
  if (connection) {
    await connection.close();
  }
}

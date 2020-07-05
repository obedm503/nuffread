import { resolve } from 'path';
import { Connection, createConnection } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { logger } from '../util';
import { SnakeNamingStrategy } from './snake-case';
import { typeormLogger } from './util';
export { Base } from './util';

let connection: Connection | undefined;

export async function connect(): Promise<Connection> {
  if (!connection) {
    const connectionOptions: PostgresConnectionOptions = {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [resolve(__dirname, './entities/*')],
      migrations: [resolve(__dirname, './migrations/*')],
      // subscribers: ['./subscriber/**/*.ts'],
      logger: typeormLogger,
      maxQueryExecutionTime: 300,
      ssl: { rejectUnauthorized: false },
      // cache: true,
      namingStrategy: new SnakeNamingStrategy(),
    };
    logger.info('connected db');
    connection = await createConnection(connectionOptions);
  }

  return connection;
}
export async function close() {
  if (connection) {
    logger.info('closed db');
    await connection.close();
  }
}

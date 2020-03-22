import { resolve } from 'path';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Connection,
  createConnection,
  CreateDateColumn,
  Logger,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { logger, validate } from '.';
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

export class Base extends BaseEntity {
  @BeforeInsert()
  @BeforeUpdate()
  validate(): Promise<void> {
    return validate(this);
  }
}

const pinoLogger: Logger = {
  logQuery(query, params) {
    logger.debug({ query: query.replace(/"/g, ''), params }, 'query db');
  },
  logQueryError(error, query, params) {
    logger.error({ error, query, params }, 'db error');
  },
  log: (level, msg) => {
    switch (level) {
      case 'info':
      case 'log':
        logger.debug(msg);
        break;
      case 'warn':
        logger.warn(msg);
    }
  },
  logQuerySlow(duration, query, params) {
    logger.warn({ query, params, duration }, 'db slow query');
  },
  logMigration(msg) {
    logger.info({ migration: msg }, 'db migration');
  },
  logSchemaBuild(msg) {
    logger.info(msg);
  },
};

let connection: Connection | undefined;

export async function connect(): Promise<Connection> {
  if (!connection) {
    const connectionOptions: PostgresConnectionOptions = {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [resolve(__dirname, '../entities/*')],
      migrations: [resolve(__dirname, '../migrations/*')],
      // subscribers: ['./subscriber/**/*.ts'],
      logger: pinoLogger,
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

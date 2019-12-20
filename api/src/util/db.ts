import { UserInputError } from 'apollo-server-express';
import { validate } from 'class-validator';
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
import { logger } from '.';
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
  async validate() {
    const errors = await validate(this, {
      skipMissingProperties: true,
      forbidUnknownValues: true,
    });
    if (errors.length > 0) {
      const msg = errors
        .map(err => {
          const constraints = Object.values(err.constraints).join(', ');
          return `${err.property}: ${constraints} got '${this[err.property]}'`;
        })
        .join(';\n');
      throw new UserInputError(msg);
    }
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
    logger.debug({ schema: msg }, 'db build schema');
  },
};

let connection: Connection | undefined;

export async function connect(
  entities: Array<typeof Base>,
): Promise<Connection> {
  if (!connection) {
    const connectionOptions: PostgresConnectionOptions = {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities,
      migrations: [resolve(__dirname, '../migrations/*')],
      // subscribers: ['./subscriber/**/*.ts'],
      logger: pinoLogger,
      maxQueryExecutionTime: 300,
      extra: {
        ssl: true,
      },
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

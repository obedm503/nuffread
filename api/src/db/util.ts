import { registerDecorator, ValidationOptions } from 'class-validator';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  Logger,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { logger, validate } from '../util';

type Class = new (...args: any[]) => any;
export function IsInstance(getter: () => Class, options?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: any) {
          const Type = getter();
          return typeof Type === 'function' && value instanceof Type;
        },
      },
    });
  };
}

export function IsEdu(options?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && value.endsWith('.edu');
        },
      },
    });
  };
}

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
  validateInsert(): Promise<void> {
    return validate(this);
  }

  @BeforeUpdate()
  validateUpdate(): Promise<void> {
    return validate(this, {
      skipMissingProperties: true,
    });
  }
}

export const typeormLogger: Logger = {
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

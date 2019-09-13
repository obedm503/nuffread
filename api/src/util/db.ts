import { UserInputError } from 'apollo-server-express';
import {
  registerDecorator,
  validate,
  ValidationOptions,
} from 'class-validator';
import { resolve } from 'path';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
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
export function IsEdu(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: 'isEdu',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && value.endsWith('.edu');
        },
      },
    });
  };
}

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

let connection: Connection | undefined;

export async function connect(
  entities: Array<typeof Base>,
): Promise<Connection> {
  if (!connection) {
    const connectionOptions: PostgresConnectionOptions = {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities,
      migrations: [resolve(__dirname, '../migrations/*.ts')],
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
  }

  return connection;
}
export async function close() {
  if (connection) {
    await connection.close();
  }
}

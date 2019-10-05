import { registerDecorator, ValidationOptions } from 'class-validator';
import { Request } from 'express';
import * as pino from 'pino';
import { FindOneOptions } from 'typeorm';
import { Base } from './db';

export async function findOne<T extends Base>(
  Ent: typeof Base,
  id: string,
  config?: FindOneOptions<T>,
) {
  const value = await Ent.findOne<T>(id, { cache: true, ...config });
  if (!value) {
    throw new Error(`Could not find ${Ent.name} with id ${id}`);
  }
  return value;
}
/**  gets the server's base url */
export const getUrl = (req: Request) => {
  const includePort = req.hostname === 'localhost';
  if (includePort) {
    return `${req.protocol}://${req.hostname}:${process.env.PORT}`;
  } else {
    return `${req.protocol}://${req.hostname}`;
  }
};

export const sleep = (timeout: number): Promise<void> =>
  new Promise(res => {
    setTimeout(res, timeout);
  });

const production = process.env.NODE_ENV === 'production';
export const logger = pino({
  level: production ? 'info' : 'trace',
  prettyPrint: !production && {
    ignore: 'pid,hostname,time',
  },
});

type Class = new (...args: any[]) => any;
export function IsInstance(getter: () => Class, options?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: any) {
          const Type = getter();
          return Type && typeof Type === 'function' && value instanceof Type;
        },
      },
    });
  };
}

export function IsEdu(options?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
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

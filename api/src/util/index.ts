import { UserInputError } from 'apollo-server-express';
import {
  registerDecorator,
  validate as validator,
  ValidationOptions,
} from 'class-validator';
import { Request } from 'express';
import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import * as pino from 'pino';
import { FindOneOptions, SelectQueryBuilder } from 'typeorm';
import { Listing, User } from '../entities';
import { IPaginationInput } from '../schema.gql';
import { userSession } from './auth';
import { Base } from './db';
import { GetMe, UserSession } from './types';

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
          return typeof Type === 'function' && value instanceof Type;
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

export const jwt = {
  sign: (payload: any, options: SignOptions): Promise<string> => {
    return new Promise((res, rej) => {
      sign(payload, process.env.SECRET!, options, (err, token) =>
        err ? rej(err) : res(token),
      );
    });
  },
  verify: (token: string, options?: VerifyOptions): Promise<any> => {
    return new Promise((res, rej) => {
      verify(token, process.env.SECRET!, options, (err, payload) =>
        err ? rej(err) : res(payload),
      );
    });
  },
};

export function paginationOptions(
  paginate?: IPaginationInput,
): { take: number; skip?: number } {
  return { take: paginate?.limit || 10, skip: paginate?.offset };
}

export async function validate(obj: object) {
  const errors = await validator(obj, {
    skipMissingProperties: true,
    forbidUnknownValues: true,
  });
  if (errors.length > 0) {
    const msg = errors
      .map(err => {
        const constraints = Object.values(err.constraints).join(', ');
        return `${err.property}: ${constraints} got '${obj[err.property]}'`;
      })
      .join(';\n');
    throw new UserInputError(msg);
  }
}

export async function sameSchoolListings({
  session,
  getMe,
}: {
  session?: UserSession;
  getMe: GetMe;
}): Promise<SelectQueryBuilder<Listing>> {
  const query = Listing.createQueryBuilder('listing');

  if (userSession(session)) {
    const me = await getMe();
    if (me instanceof User) {
      query.innerJoin('listing.user', 'user', 'user.schoolId = :schoolId', {
        schoolId: me.schoolId,
      });
    }
  }

  return query;
}

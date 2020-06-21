import { UserInputError } from 'apollo-server-express';
import { validate as validator, ValidatorOptions } from 'class-validator';
import { Request } from 'express';
import { sign, SignOptions, verify, VerifyOptions } from 'jsonwebtoken';
import pino from 'pino';

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

const isProduction = process.env.NODE_ENV === 'production';
export const logger = pino({
  level: isProduction ? 'info' : 'trace',
  prettyPrint: !isProduction && {
    ignore: 'pid,hostname,time',
  },
});

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

export async function validate(obj: object, opts?: ValidatorOptions) {
  const errors = await validator(obj, {
    ...opts,
    forbidUnknownValues: true,
  });
  if (errors.length > 0) {
    const msg = errors
      .map(err => {
        if (!err.constraints) {
          return '';
        }
        const constraints = Object.values(err.constraints).join(', ');
        return `${err.property}: ${constraints} got '${obj[err.property]}'`;
      })
      .filter(Boolean)
      .join(';\n');
    throw new UserInputError(msg);
  }
}

export function btoa(str: string | Buffer): string {
  let buffer;

  if (str instanceof Buffer) {
    buffer = str;
  } else {
    buffer = Buffer.from(str.toString(), 'binary');
  }

  return buffer.toString('base64');
}
export function atob(str: string): string {
  return Buffer.from(str, 'base64').toString('binary');
}

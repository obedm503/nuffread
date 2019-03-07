import { UserInputError } from 'apollo-server-express';
import { validate as validator } from 'class-validator';
import { Request } from 'express';
import { BaseEntity, FindOneOptions } from 'typeorm';

export async function validate<T>(input: T) {
  const errors = await validator(input, {
    skipMissingProperties: true,
    forbidUnknownValues: true,
  });
  if (errors.length > 0) {
    const msg = errors
      .map(err => {
        const constraints = Object.values(err.constraints).join(', ');
        return `${err.property}: ${constraints} got '${input[err.property]}'`;
      })
      .join(';\n');
    throw new UserInputError(msg);
  }
}

export async function findOne<T extends BaseEntity>(
  Ent: typeof BaseEntity,
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
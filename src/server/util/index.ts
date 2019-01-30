import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { validate as validator } from 'class-validator';
import DataLoader from 'dataloader';
import { Request } from 'express';
import { FindOneOptions, Repository } from 'typeorm';
import { School } from '../school/school.entity';
import { Seller } from '../seller/seller.entity';
import { Admin } from '../admin/admin.entity';

export async function validate<T>(input: T) {
  const errors = await validator(input, {
    skipMissingProperties: true,
    forbidUnknownValues: true,
  });
  if (errors.length > 0) {
    const s = errors
      .map(err => {
        const constraints = Object.values(err.constraints).join(', ');
        return `${err.property}: ${constraints} got ${JSON.stringify(
          input[err.property],
        )}`;
      })
      .join(';\n');
    throw new HttpException(s, HttpStatus.BAD_REQUEST);
  }
  return input;
}

export async function findOne<T>(
  repo: Repository<T>,
  id: string,
  config?: FindOneOptions<T>,
) {
  const value = await repo.findOne(id, { cache: true, ...config });
  if (!value) {
    const type = repo.metadata.targetName;
    throw new NotFoundException(`Could not find ${type} with id ${id}`);
  }
  return value;
}

export async function getMany<T>(repo: Repository<T>, ids: string[]) {
  const items = await repo.findByIds(ids);
  return ids.map(id => items.find(item => (item as any).id === id) || null);
}

export type IContext = {
  req: Request;
  user: Seller | Admin;
  sellerLoader: DataLoader<string, Seller | null>;
  adminLoader: DataLoader<string, Admin | null>;
  schoolLoader: DataLoader<string, School | null>;
};

/**  gets the server's base url */
export const getUrl = (req: Request) => {
  const includePort = req.hostname === 'localhost';
  if (includePort) {
    return `${req.protocol}://${req.hostname}:${process.env.PORT}`;
  } else {
    return `${req.protocol}://${req.hostname}`;
  }
};

export interface IService<T> {
  create(
    obj: { id: never; createdAt: never; updatedAt: never } & Partial<T>,
  ): Promise<T>;
  update(obj: Partial<T> & { id: string }): Promise<T>;
  delete(id: string): Promise<void>;
  get(id: string): Promise<T>;
  getMany(ids: string[]): Promise<Array<T | null>>;
}

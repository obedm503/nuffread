import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getMany, findOne, IService, validate } from '../util';
import { School } from './school.entity';

@Injectable()
export class SchoolService implements IService<School> {
  constructor(@Inject(School) private readonly repo: Repository<School>) {}

  async create({ name }: Partial<School>) {
    const user = this.repo.create({
      name,
    });

    await validate(user);
    const { id } = await this.repo.save(user);
    return findOne(this.repo, id);
  }

  async update(user: Partial<School>) {
    await validate(user);
    return this.repo.save(user);
  }

  async delete(id: string) {
    await this.repo.delete(id);
  }

  get(id: string) {
    return findOne(this.repo, id);
  }

  getMany(ids: string[]) {
    return getMany(this.repo, ids);
  }
}

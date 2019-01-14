import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getMany, findOne, IService, validate } from '../util';
import { Admin } from './admin.entity';

@Injectable()
export class AdminService implements IService<Admin> {
  constructor(@Inject(Admin) private readonly repo: Repository<Admin>) {}

  async create({ email }: Partial<Admin>) {
    const admin = this.repo.create({
      email,
    });

    await validate(admin);
    const { id } = await this.repo.save(admin);
    return await this.repo.findOneOrFail(id);
  }

  async update(admin: Partial<Admin>) {
    await validate(admin);
    return this.repo.save(admin);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  get(id: string) {
    return findOne(this.repo, id);
  }

  getMany(ids: string[]) {
    return getMany(this.repo, ids);
  }
}

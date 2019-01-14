import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getMany, findOne, IService, validate } from '../util';
import { Seller } from './seller.entity';

@Injectable()
export class SellerService implements IService<Seller> {
  constructor(@Inject(Seller) private readonly repo: Repository<Seller>) {}

  async create({ email }: Partial<Seller>) {
    const seller = this.repo.create({
      email,
    });

    await validate(seller);
    const { id } = await this.repo.save(seller);
    return await this.repo.findOneOrFail(id);
  }

  async update(seller: Seller) {
    await validate(seller);
    return this.repo.save(seller);
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

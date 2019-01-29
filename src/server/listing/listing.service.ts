import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { getMany, findOne, IService, validate } from '../util';
import { Listing } from './listing.entity';

@Injectable()
export class ListingService implements IService<Listing> {
  constructor(@Inject(Listing) private readonly repo: Repository<Listing>) {}

  async create({ isbn, thumbnail }: Partial<Listing>) {
    const seller = this.repo.create({
      isbn,
      thumbnail,
    });

    await validate(seller);
    const { id } = await this.repo.save(seller);
    return await this.repo.findOneOrFail(id);
  }

  async update(seller: Listing) {
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

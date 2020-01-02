import { Listing } from '../entities';
import { IBookResolvers } from '../schema.gql';
import { paginationOptions } from '../util';

export const BookResolver: IBookResolvers = {
  async listings({ id }, { paginate }) {
    const { take, skip } = paginationOptions(paginate);
    const [items, totalCount] = await Listing.findAndCount({
      where: { bookId: id },
      take,
      skip,
      order: { createdAt: 'DESC' },
    });
    return { items, totalCount };
  },
};

import { Book, Listing } from '../entities';
import { IBook, IBookListingsArgs } from '../schema.gql';
import { IResolver } from '../util/types';

export const BookResolver: IResolver<IBook, Book> = {
  async listings({ id }, { paginate }: IBookListingsArgs) {
    const [items, totalCount] = await Listing.findAndCount({
      where: { bookId: id },
      take: (paginate && paginate.limit) || 10,
      skip: paginate && paginate.offset,
      order: { createdAt: 'DESC' },
    });
    return { items, totalCount };
  },
};

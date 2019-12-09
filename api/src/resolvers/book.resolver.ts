import { Book, Listing } from '../entities';
import { IBook, IBookListingsArgs } from '../schema.gql';
import { paginationOptions } from '../util';
import { IResolver } from '../util/types';

export const BookResolver: IResolver<IBook, Book> = {
  async listings({ id }, { paginate }: IBookListingsArgs) {
    const { limit, offset } = paginationOptions(paginate);
    const [items, totalCount] = await Listing.findAndCount({
      where: { bookId: id },
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
    return { items, totalCount };
  },
};

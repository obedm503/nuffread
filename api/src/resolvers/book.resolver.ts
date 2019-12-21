import { Book, Listing } from '../entities';
import { IBook, IBookListingsArgs } from '../schema.gql';
import { paginationOptions } from '../util';
import { IResolver } from '../util/types';

export const BookResolver: IResolver<IBook, Book> = {
  async listings({ id }, { paginate }: IBookListingsArgs) {
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

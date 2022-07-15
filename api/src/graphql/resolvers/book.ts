import { Listing } from '../../db/entities';
import { processImageLink } from '../../util/google-books';
import { IBookResolvers } from '../schema.gql';
import { paginationOptions } from '../util';

export const BookResolver: IBookResolvers = {
  thumbnail({ thumbnail }) {
    if (!thumbnail) {
      return;
    }
    return processImageLink(thumbnail);
  },
  async listings({ id }, { paginate }) {
    const { take, skip } = paginationOptions(paginate);

    const [items, totalCount] = await Listing.createQueryBuilder('listing')
      .where('listing.bookId = :bookId', { bookId: id })
      .andWhere('listing.soldAt IS NULL')
      .orderBy('listing.createdAt', 'DESC')
      .limit(take)
      .offset(skip)
      .getManyAndCount();
    return { items, totalCount };
  },
};

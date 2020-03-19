import { IBookResolvers } from '../schema.gql';
import { paginationOptions, sameSchoolListings } from '../util';
import { processImageLink } from '../util/google-books';

export const BookResolver: IBookResolvers = {
  thumbnail({ thumbnail }) {
    if (!thumbnail) {
      return;
    }
    return processImageLink(thumbnail);
  },
  async listings({ id }, { paginate }, { session, getMe }) {
    const { take, skip } = paginationOptions(paginate);

    const query = await sameSchoolListings({ session, getMe });
    const [items, totalCount] = await query
      .where('listing.bookId = :bookId', { bookId: id })
      .orderBy('listing.createdAt', 'DESC')
      .limit(take)
      .offset(skip)
      .getManyAndCount();
    return { items, totalCount };
  },
};

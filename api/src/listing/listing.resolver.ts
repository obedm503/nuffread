import { IListing } from '../schema.gql';
import { IResolver } from '../util/types';
import { Listing } from './listing.entity';

export const ListingResolver: IResolver<IListing, Listing> = {
  async school({ schoolId }, args, { schoolLoader }) {
    return (await schoolLoader.load(schoolId))!;
  },
  async user({ userId, user }, args, { userLoader }) {
    return user || (await userLoader.load(userId));
  },
  async book({ bookId, book }, args, { bookLoader }) {
    return book || (await bookLoader.load(bookId));
  },
};

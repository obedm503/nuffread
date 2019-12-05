import { Listing } from '../entities';
import { IListing } from '../schema.gql';
import { userSession } from '../util/auth';
import { IResolver } from '../util/types';

export const ListingResolver: IResolver<IListing, Listing> = {
  async user({ userId, user }, args, { userLoader, session }) {
    if (!userSession(session)) {
      return;
    }
    return user || (await userLoader.load(userId));
  },
  async book({ bookId, book }, args, { bookLoader }) {
    return book || (await bookLoader.load(bookId));
  },
};

import { Listing } from '../entities';
import { IListing } from '../schema.gql';
import { ensureUser } from '../util/auth';
import { IResolver } from '../util/types';

export const ListingResolver: IResolver<IListing, Listing> = {
  userId({ userId }, args, { session }) {
    ensureUser(session);
    return userId;
  },
  async user({ userId, user }, args, { userLoader, session }) {
    ensureUser(session);
    return user || (await userLoader.load(userId));
  },
  async book({ bookId, book }, args, { bookLoader }) {
    return book || (await bookLoader.load(bookId));
  },
};

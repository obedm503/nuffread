import { Listing } from '../entities';
import { IListing, IUser } from '../schema.gql';
import { ensureUser } from '../util/auth';
import { IResolver } from '../util/types';

export const ListingResolver: IResolver<IListing, Listing> = {
  userId({ userId }, args, { me }) {
    ensureUser(me);
    return userId;
  },
  async user({ userId, user }, args, { userLoader, me }): Promise<IUser> {
    ensureUser(me);
    return (user || (await userLoader.load(userId))) as any;
  },
  async book({ bookId, book }, args, { bookLoader }) {
    return book || (await bookLoader.load(bookId));
  },
};

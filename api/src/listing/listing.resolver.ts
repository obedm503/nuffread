import { IListing, IUser } from '../schema.gql';
import { isUser } from '../util/auth';
import { IResolver } from '../util/types';
import { Listing } from './listing.entity';

export const ListingResolver: IResolver<IListing, Listing> = {
  userId({ userId }, args, { me }) {
    isUser(me);
    return userId;
  },
  async user({ userId, user }, args, { userLoader, me }): Promise<IUser> {
    isUser(me);
    return (user || (await userLoader.load(userId))) as any;
  },
  async book({ bookId, book }, args, { bookLoader }) {
    return book || (await bookLoader.load(bookId));
  },
};

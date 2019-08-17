import { IListing } from '../schema.gql';
import { IResolver } from '../util/types';
import { Listing } from './listing.entity';

export const ListingResolver: IResolver<IListing, Listing> = {
  async school({ schoolId }, args, { schoolLoader }) {
    return (await schoolLoader.load(schoolId))!;
  },
  async user({ userId }, args, { userLoader }) {
    return (await userLoader.load(userId)) as any;
  },
  async book({ bookId, book }, args, { bookLoader }): Promise<any> {
    return book || (await bookLoader.load(bookId));
  },
};

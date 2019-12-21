import { Listing } from '../entities';
import { SavedListing } from '../entities/saved-listing.entity';
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
  async school(
    { userId, user: loadedUser },
    args,
    { userLoader, schoolLoader },
  ) {
    const user = loadedUser || (await userLoader.load(userId));
    return user && (user.school || (await schoolLoader.load(user.schoolId)));
  },
  async book({ bookId, book }, args, { bookLoader }) {
    return book || (await bookLoader.load(bookId));
  },
  async saved({ userId, id }, args, { session }) {
    if (!userSession(session)) {
      return undefined;
    }
    const saved = await SavedListing.findOne({
      where: { listingId: id, userId },
    });
    return !!saved;
  },
};

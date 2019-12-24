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
  async saved(listing, args, { session, savedListingLoader }) {
    if (!userSession(session)) {
      return undefined;
    }

    // in format listingId::userId
    const saved = await savedListingLoader.load(
      [listing.id, session.userId].join('::'),
    );
    return !!saved;
  },
};

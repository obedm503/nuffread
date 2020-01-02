import { IListingResolvers } from '../schema.gql';
import { userSession } from '../util/auth';

export const ListingResolver: IListingResolvers = {
  async user({ userId, user }, {}, { userLoader, session }) {
    if (!userSession(session)) {
      return;
    }
    return user || (await userLoader.load(userId));
  },
  async school({ userId, user: loadedUser }, {}, { userLoader, schoolLoader }) {
    const user = loadedUser || (await userLoader.load(userId));
    return user && (user.school || (await schoolLoader.load(user.schoolId)));
  },
  async book({ bookId, book }, {}, { bookLoader }) {
    return book || (await bookLoader.load(bookId));
  },
  async saved(listing, {}, { session, savedListingLoader }) {
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

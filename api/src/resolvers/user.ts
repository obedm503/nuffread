import { Admin, Listing, RecentListing, SavedListing, User } from '../entities';
import { ISystemUserResolvers, IUserResolvers } from '../schema.gql';
import { logger, paginationOptions } from '../util';
import { ensureAdmin, ensureUser } from '../util/auth';
import { getSchoolName } from '../util/schools';

const justListings = (listings: (Listing | Error | undefined)[]) =>
  listings.filter((listing): listing is Listing => {
    if (listing instanceof Listing) {
      return true;
    }
    if (listing instanceof Error) {
      throw listing;
    }
    return false;
  });

export const UserResolver: IUserResolvers = {
  // deprecated
  schoolName({ email }) {
    logger.info('User.schoolName is deprecated', { email });
    return getSchoolName(email);
  },
  async school({ school, schoolId }, {}, { schoolLoader }) {
    return school || (await schoolLoader.load(schoolId));
  },
  confirmedAt({ confirmedAt }, {}, { session }) {
    ensureAdmin(session);
    return confirmedAt;
  },
  async listings(user, {}, { session }) {
    ensureUser(session);
    const listings = await Listing.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      relations: ['book'],
    });
    return listings;
  },
  async recent(user, {}, { listingLoader }) {
    const recents = await RecentListing.find({
      where: { userId: user.id },
      order: { updatedAt: 'DESC' },
      take: 30,
    });

    const listings = await listingLoader.loadMany(
      recents.map(r => r.listingId),
    );
    return justListings(listings);
  },
  async saved(user, { paginate }, { listingLoader }) {
    const { take, skip } = paginationOptions(paginate);
    const [saved, totalCount] = await SavedListing.findAndCount({
      where: { userId: user.id },
      order: { updatedAt: 'DESC' },
      take,
      skip,
    });

    const listings = await listingLoader.loadMany(saved.map(s => s.listingId));
    return {
      items: justListings(listings),
      totalCount,
    };
  },
};

export const SystemUserResolver: ISystemUserResolvers = {
  __resolveType(me) {
    if (me instanceof User) {
      return 'User';
    }
    if (me instanceof Admin) {
      return 'Admin';
    }
  },
};

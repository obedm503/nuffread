import { Admin, Listing, RecentListing, User } from '../entities';
import { ISystemUser, IUser } from '../schema.gql';
import { ensureAdmin, ensureUser } from '../util/auth';
import { getSchoolName } from '../util/schools';
import { IResolver } from '../util/types';

export const UserResolver: IResolver<IUser, User> = {
  schoolName({ email }) {
    return getSchoolName(email);
  },
  confirmedAt({ confirmedAt }, args, { session }) {
    ensureAdmin(session);
    return confirmedAt;
  },
  name(user) {
    return user.name || user.email;
  },
  async listings(user, args, { session }) {
    ensureUser(session);
    const listings = await Listing.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      relations: ['book'],
    });
    return listings;
  },
  async recent(user) {
    const recents = await RecentListing.find({
      where: { userId: user.id },
      relations: ['listing'],
      order: { updatedAt: 'DESC' },
    });

    return recents.map(recent => recent.listing);
  },
};

export const SystemUserResolver: IResolver<ISystemUser, Admin | User> = {
  __resolveType(me) {
    if (me instanceof User) {
      return 'User';
    }
    if (me instanceof Admin) {
      return 'Admin';
    }
  },
};

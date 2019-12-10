import { Admin, Listing, RecentListing, User } from '../entities';
import { IListing, ISystemUser, IUser } from '../schema.gql';
import { ensureAdmin, ensureUser } from '../util/auth';
import { getSchoolName } from '../util/schools';
import { IResolver } from '../util/types';

export const UserResolver: IResolver<IUser, User> = {
  // deprecated
  schoolName({ email }) {
    return getSchoolName(email);
  },
  async school({ school, schoolId }, args, { schoolLoader }) {
    return school || (await schoolLoader.load(schoolId));
  },
  confirmedAt({ confirmedAt }, args, { session }) {
    ensureAdmin(session);
    return confirmedAt;
  },
  async listings(user, args, { session }) {
    ensureUser(session);
    const listings = await Listing.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      relations: ['book'],
    });
    return (listings as any) as IListing[];
  },
  async recent(user) {
    const recents = await RecentListing.find({
      where: { userId: user.id },
      relations: ['listing'],
      order: { updatedAt: 'DESC' },
      take: 30,
    });

    return (recents.map(recent => recent.listing) as any) as IListing[];
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

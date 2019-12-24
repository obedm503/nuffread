import { Admin, Listing, RecentListing, SavedListing, User } from '../entities';
import { IListing, ISystemUser, IUser, IUserSavedArgs } from '../schema.gql';
import { paginationOptions } from '../util';
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
  async recent(user, args, { listingLoader }) {
    const recents = await RecentListing.find({
      where: { userId: user.id },
      order: { updatedAt: 'DESC' },
      take: 30,
    });

    const listings = await listingLoader.loadMany(
      recents.map(r => r.listingId),
    );
    return (listings as any) as IListing[];
  },
  async saved(user, { paginate }: IUserSavedArgs, { listingLoader }) {
    const { take, skip } = paginationOptions(paginate);
    const [saved, totalCount] = await SavedListing.findAndCount({
      where: { userId: user.id },
      order: { updatedAt: 'DESC' },
      take,
      skip,
    });

    const listings = await listingLoader.loadMany(saved.map(s => s.listingId));
    return {
      items: (listings as any) as IListing[],
      totalCount,
    };
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

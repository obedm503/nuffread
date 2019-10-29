import { Admin, Listing, User } from '../entities';
import { IUser, SystemUser } from '../schema.gql';
import { ensureAdmin, ensureUser } from '../util/auth';
import { getSchoolName } from '../util/schools';
import { IResolver } from '../util/types';

export const UserResolver: IResolver<IUser, User> = {
  schoolName({ email }) {
    return getSchoolName(email);
  },
  confirmedAt({ confirmedAt }, args, { me }) {
    ensureAdmin(me);
    return confirmedAt;
  },
  name(user) {
    return user.name || user.email;
  },
  async listings(user, args, { me }) {
    ensureUser(me);
    const listings = await Listing.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      relations: ['book'],
    });
    return listings;
  },
};

export const SystemUserResolver: IResolver<SystemUser, Admin | User> = {
  __resolveType(me) {
    if (me instanceof User) {
      return 'User';
    }
    if (me instanceof Admin) {
      return 'Admin';
    }
  },
};

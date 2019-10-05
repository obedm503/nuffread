import { Listing, User, Admin } from '../entities';
import { IUser, SystemUser } from '../schema.gql';
import { isAdmin, isUser } from '../util/auth';
import { IResolver } from '../util/types';

export const UserResolver: IResolver<IUser, User> = {
  confirmedAt({ confirmedAt }, args, { me }) {
    isAdmin(me);
    return confirmedAt;
  },
  name(user) {
    return user.name || user.email;
  },
  async listings(user, args, { me }) {
    isUser(me);
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

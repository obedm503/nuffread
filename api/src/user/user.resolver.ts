import { Listing } from '../listing/listing.entity';
import { IUser } from '../schema.gql';
import { isUser } from '../util/auth';
import { IResolver } from '../util/types';
import { User } from './user.entity';

export const UserResolver: IResolver<IUser, User> = {
  name(user) {
    return user.name || user.email;
  },
  async listings(user, args, { me }) {
    if (!isUser(me)) {
      return [];
    }
    const listings = await Listing.find({
      where: { userId: user.id },
      order: { createdAt: 'DESC' },
      relations: ['book'],
    });
    return listings;
  },
};

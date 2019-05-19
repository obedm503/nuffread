import { IListing, ISchool, IUser } from '../schema.gql';
import { IResolver } from '../util/types';
import { Listing } from './listing.entity';

export const ListingResolver: IResolver<IListing, Listing> = {
  school({ schoolId }, args, { schoolLoader }) {
    return (schoolLoader.load(schoolId) as any) as ISchool;
  },
  user({ userId }, args, { userLoader }) {
    return (userLoader.load(userId) as any) as IUser;
  },
};

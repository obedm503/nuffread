import { IResolver } from '../util/types';
import { Listing } from './listing.entity';

export const ListingResolver: IResolver<GQL.IListing, Listing> = {
  school({ schoolId }, args, { schoolLoader }) {
    return (schoolLoader.load(schoolId) as any) as GQL.ISchool;
  },
};

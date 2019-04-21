import { IListing, ISchool, ISeller } from '../../../schema.gql';
import { IResolver } from '../util/types';
import { Listing } from './listing.entity';

export const ListingResolver: IResolver<IListing, Listing> = {
  school({ schoolId }, args, { schoolLoader }) {
    return (schoolLoader.load(schoolId) as any) as ISchool;
  },
  seller({ sellerId }, args, { sellerLoader }) {
    return (sellerLoader.load(sellerId) as any) as ISeller;
  },
};

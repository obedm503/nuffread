import { IResolverObject } from 'graphql-tools';
import { IContext } from '../util';
import { Listing } from './listing.entity';

export const ListingResolver: IResolverObject<Listing, IContext> = {
  school({ schoolId }, args, { schoolLoader }) {
    return schoolLoader.load(schoolId);
  },
};

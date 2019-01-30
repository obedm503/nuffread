import { IResolverObject } from 'graphql-tools';
import { IContext } from '../util';
import { Seller } from './seller.entity';

export const SellerResolver: IResolverObject<Seller, IContext> = {
  school({ schoolId }, args, { schoolLoader }) {
    return schoolLoader.load(schoolId);
  },
};

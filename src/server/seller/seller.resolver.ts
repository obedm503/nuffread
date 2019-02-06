import { IResolver } from '../util/types';
import { Seller } from './seller.entity';

export const SellerResolver: IResolver<GQL.ISeller, Seller> = {
  name(seller) {
    return seller.name || seller.email;
  },
};

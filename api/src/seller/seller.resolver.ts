import { IListing, ISeller } from '../../../schema.gql';
import { Listing } from '../listing/listing.entity';
import { isSeller } from '../util/auth';
import { IResolver } from '../util/types';
import { Seller } from './seller.entity';

export const SellerResolver: IResolver<ISeller, Seller> = {
  name(seller) {
    return seller.name || seller.email;
  },
  async listings(seller, args, { user }) {
    if (!isSeller(user)) {
      return [];
    }

    const listings = await Listing.find({
      where: { sellerId: seller.id },
      order: { createdAt: 'DESC' },
    });
    return (listings as any) as IListing[];
  },
};

import { Listing } from '../listing/listing.entity';
import { checkUser } from '../util/auth';
import { IResolver } from '../util/types';
import { Seller } from './seller.entity';

export const SellerResolver: IResolver<GQL.ISeller, Seller> = {
  name(seller) {
    return seller.name || seller.email;
  },
  async listings(seller, args, { user }) {
    checkUser(Seller, user);

    const listings = await Listing.find({
      where: { sellerId: seller.id },
      order: { createdAt: 'DESC' },
    });
    return (listings as any) as GQL.IListing[];
  },
};

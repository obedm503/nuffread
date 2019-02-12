import { Listing } from '../listing/listing.entity';
import { AuthenticationError, AuthorizationError } from '../util';
import { IResolver } from '../util/types';
import { Seller } from './seller.entity';

export const SellerResolver: IResolver<GQL.ISeller, Seller> = {
  name(seller) {
    return seller.name || seller.email;
  },
  async listings(seller, args, { user }) {
    if (!user) {
      throw new AuthenticationError();
    }
    if (!(user instanceof Seller)) {
      throw new AuthorizationError();
    }

    const listings = await Listing.find({
      where: { sellerId: seller.id },
      order: { createdAt: 'DESC' },
    });
    return (listings as any) as GQL.IListing[];
  },
};

import { AuthenticationError } from 'apollo-server-core';
import { Listing } from '../listing/listing.entity';
import { IResolver } from '../util/types';

const search = (a: string, b: string) => {
  a = a.trim().toLowerCase();
  b = b.trim().toLowerCase();

  return a.includes(b) || b.includes(a);
};

export const QueryResolver: IResolver<GQL.IQuery> = {
  async search(
    _,
    { query, maxPrice, minPrice }: GQL.ISearchOnQueryArguments,
  ): Promise<any[]> {
    const books = await Listing.find();
    if (!query) {
      return books;
    }

    let filtered = books.filter(b => {
      if (b.isbn.find(code => search(code, query))) {
        return true;
      }
      if (search(b.title, query)) {
        return true;
      }
      if (b.subTitle && search(b.subTitle, query)) {
        return true;
      }
      if (b.authors.find(a => search(a, query))) {
        return true;
      }
    });

    if (minPrice || maxPrice) {
      filtered = filtered.filter(b => {
        if (minPrice && !maxPrice) {
          return b.price >= minPrice;
        }
        if (!minPrice && maxPrice) {
          return b.price <= maxPrice;
        }
        if (minPrice && maxPrice) {
          return minPrice <= b.price && b.price <= maxPrice;
        }
      });
    }
    return filtered;
  },

  async me(_, args, { user }) {
    if (!user) {
      throw new AuthenticationError('Unauthenticated');
    }
    return (user as any) as GQL.User;
  },

  listing(_, { id }: GQL.IListingOnQueryArguments, { user, listingLoader }) {
    if (!user) {
      throw new AuthenticationError('Unauthenticated');
    }
    return (listingLoader.load(id) as any) as GQL.IListing;
  },
};

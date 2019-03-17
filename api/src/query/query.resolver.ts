import { Listing } from '../listing/listing.entity';
import { Seller } from '../seller/seller.entity';
import { isAdmin } from '../util/auth';
import { getBook, searchBooks } from '../util/books';
import { IResolver } from '../util/types';

const search = (a: string, b: string) => {
  a = a.trim().toLowerCase();
  b = b.trim().toLowerCase();

  return a.includes(b) || b.includes(a);
};

export const QueryResolver: IResolver<GQL.IQuery> = {
  async search(_, { query, maxPrice, minPrice }: GQL.ISearchOnQueryArguments) {
    const books: any[] = await Listing.find();
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

  async top() {
    // TODO: implement real top listings, whatever that means
    return (await Listing.find({ take: 10 })) as any[];
  },

  async me(_, args, { user }) {
    if (!user) {
      return null;
    }
    return (user as any) as GQL.User;
  },

  listing(_, { id }: GQL.IListingOnQueryArguments, { user, listingLoader }) {
    return (listingLoader.load(id) as any) as GQL.IListing;
  },

  async sellers(_, args, { user }) {
    if (!isAdmin(user)) {
      return;
    }

    return Seller.find() as any;
  },

  async searchGoogle(_, { query }: GQL.ISearchGoogleOnQueryArguments) {
    return await searchBooks(query);
  },
  async googleBook(_, { id }: GQL.IGoogleBookOnQueryArguments) {
    const book = await getBook(id);
    if (!book) {
      throw new Error(`Book ${id} not found`);
    }
    return book;
  },
};

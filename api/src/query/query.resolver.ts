import { getConnection } from 'typeorm';
import { Listing } from '../listing/listing.entity';
import {
  IGoogleBookOnQueryArguments,
  IListing,
  IListingOnQueryArguments,
  IQuery,
  ISearchGoogleOnQueryArguments,
  ISearchOnQueryArguments,
  SystemUser,
} from '../schema.gql';
import { User } from '../user/user.entity';
import { isAdmin } from '../util/auth';
import { getBook, searchBooks } from '../util/books';
import { IResolver } from '../util/types';
// import { books } from '../listing/books';

// const search = (a: string, b: string) => {
//   a = a.trim().toLowerCase();
//   b = b.trim().toLowerCase();

//   return a.includes(b) || b.includes(a);
// };

const getTopListings = async () => {
  return (await Listing.find({ take: 10 })) as any[];
};

export const QueryResolver: IResolver<IQuery> = {
  async search(_, { query, maxPrice, minPrice }: ISearchOnQueryArguments) {
    if (!query) {
      return await getTopListings();
    }

    // how to partial search
    // https://dba.stackexchange.com/questions/157951/get-partial-match-from-gin-indexed-tsvector-column/157982
    // full-text search in postgres
    // http://rachbelaid.com/postgres-full-text-search-is-good-enough/
    // postgres manual on full-text search
    // https://www.postgresql.org/docs/11/textsearch-controls.html
    const builder = getConnection()
      .createQueryBuilder(Listing, 'listing')
      .select()
      .where(
        "document_with_weights @@ to_tsquery('english'::regconfig, :query)",
        {
          query: query
            .toLowerCase()
            .trim()
            .split(' ')
            .map(s => s.trim())
            .filter(Boolean) // eliminate spaces
            .map(s => s + ':*') // allow partial search
            .join(' & '), // multiple keywords
        },
      )
      .orderBy(
        "ts_rank(document_with_weights, to_tsquery('english'::regconfig, :query))",
        'DESC',
      );

    return (await builder.getMany()) as any;

    // const books: any[] = await Listing.find();

    // let filtered = books.filter(b => {
    //   if (b.isbn.find(code => search(code, query))) {
    //     return true;
    //   }
    //   if (search(b.title, query)) {
    //     return true;
    //   }
    //   if (b.subTitle && search(b.subTitle, query)) {
    //     return true;
    //   }
    //   if (b.authors.find(a => search(a, query))) {
    //     return true;
    //   }
    // });

    // if (minPrice || maxPrice) {
    //   filtered = filtered.filter(b => {
    //     if (minPrice && !maxPrice) {
    //       return b.price >= minPrice;
    //     }
    //     if (!minPrice && maxPrice) {
    //       return b.price <= maxPrice;
    //     }
    //     if (minPrice && maxPrice) {
    //       return minPrice <= b.price && b.price <= maxPrice;
    //     }
    //   });
    // }
    // return filtered;
  },

  async top() {
    // TODO: implement real top listings, whatever that means
    return getTopListings();
  },

  async me(_, args, { me }) {
    if (!me) {
      return null;
    }
    return (me as any) as SystemUser;
  },

  listing(_, { id }: IListingOnQueryArguments, { listingLoader }) {
    return (listingLoader.load(id) as any) as IListing;
  },

  async users(_, args, { me }) {
    if (!isAdmin(me)) {
      return;
    }

    return User.find() as any;
  },

  async searchGoogle(_, { query }: ISearchGoogleOnQueryArguments) {
    return await searchBooks(query);
  },
  async googleBook(_, { id }: IGoogleBookOnQueryArguments) {
    const book = await getBook(id);
    if (!book) {
      throw new Error(`Book ${id} not found`);
    }
    return book;
  },
};

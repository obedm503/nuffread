import { getConnection } from 'typeorm';
import { Invite } from '../invite/invite.entity';
import { Listing } from '../listing/listing.entity';
import {
  IGoogleBookOnQueryArguments,
  IListingOnQueryArguments,
  IQuery,
  ISearchGoogleOnQueryArguments,
  ISearchOnQueryArguments,
} from '../schema.gql';
import { isAdmin, isUser } from '../util/auth';
import { getBook, searchBooks } from '../util/books';
import { IResolver } from '../util/types';

export const QueryResolver: IResolver<IQuery> = {
  async search(
    _,
    { query, maxPrice, minPrice }: ISearchOnQueryArguments,
    { me },
  ) {
    const segments =
      query &&
      query
        .toLowerCase()
        .trim()
        .split(' ')
        .map(s => s.trim())
        .filter(Boolean); // eliminate spaces

    if (!segments || !segments.length) {
      return [];
    }

    // how to partial search
    // https://dba.stackexchange.com/questions/157951/get-partial-match-from-gin-indexed-tsvector-column/157982
    // full-text search in postgres
    // http://rachbelaid.com/postgres-full-text-search-is-good-enough/
    // postgres manual on full-text search
    // https://www.postgresql.org/docs/11/textsearch-controls.html
    // mastering full text search
    // https://compose.com/articles/mastering-postgresql-tools-full-text-search-and-phrase-search/

    const builder = getConnection()
      .createQueryBuilder(Listing, 'listing')
      .innerJoinAndSelect('listing.book', 'book')
      .select();

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      builder.setParameter(`segment_${i}`, segment);

      if (i === 0) {
        builder.where(`book.search_text ~* :segment_${i}`);
      } else {
        builder.orWhere(`book.search_text ~* :segment_${i}`);
      }
    }

    builder.orderBy(
      `GREATEST(${segments
        .map((_, i) => {
          return `SIMILARITY(book.search_text, :segment_${i})`;
        })
        .join(', ')})`,
      'DESC',
    );

    const listings = await builder.getMany();
    return listings;
  },

  async top(_, args) {
    // TODO: implement real top listings, whatever that means
    return await Listing.find({ take: 10, relations: ['book'] });
  },

  async me(_, args, { me }) {
    return me;
  },

  listing(_, { id }: IListingOnQueryArguments, { listingLoader }) {
    return listingLoader.load(id);
  },

  async searchGoogle(_, { query }: ISearchGoogleOnQueryArguments, { me }) {
    isUser(me);

    if (!query) {
      return;
    }
    return await searchBooks(query);
  },
  async googleBook(_, { id }: IGoogleBookOnQueryArguments, { me }) {
    isUser(me);

    const book = await getBook(id);
    if (!book) {
      throw new Error(`Book ${id} not found`);
    }
    return book;
  },

  async invites(_, args, { me }) {
    isAdmin(me);

    return Invite.find();
  },
};

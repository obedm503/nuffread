import { Invite, Listing } from '../entities';
import {
  IQuery,
  IQueryGoogleBookArgs,
  IQueryListingArgs,
  IQuerySearchArgs,
  IQuerySearchGoogleArgs,
  IQueryTopArgs,
} from '../schema.gql';
import { ensureAdmin, ensureUser } from '../util/auth';
import { getBook, searchBooks } from '../util/google-books';
import { IResolver } from '../util/types';

export const QueryResolver: IResolver<IQuery> = {
  async search(_, { query, paginate }: IQuerySearchArgs, { me }) {
    const segments =
      query &&
      query
        .toLowerCase()
        .trim()
        .split(' ')
        .map(s => s.trim())
        .filter(Boolean); // eliminate spaces

    if (!segments || !segments.length) {
      return { items: [], totalCount: 0 };
    }

    // how to partial search
    // https://dba.stackexchange.com/questions/157951/get-partial-match-from-gin-indexed-tsvector-column/157982
    // full-text search in postgres
    // http://rachbelaid.com/postgres-full-text-search-is-good-enough/
    // postgres manual on full-text search
    // https://www.postgresql.org/docs/11/textsearch-controls.html
    // mastering full text search
    // https://compose.com/articles/mastering-postgresql-tools-full-text-search-and-phrase-search/

    const limit = (paginate && paginate.limit) || 10;
    const offset = paginate && paginate.offset;

    const builder = Listing.createQueryBuilder('listing')
      .innerJoinAndSelect('listing.book', 'book')
      // skip and take break with custom ORDER BY expression
      .limit(limit)
      .offset(offset);

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

    const [items, totalCount] = await builder.getManyAndCount();

    return {
      totalCount,
      items,
    };
  },

  async top(_, { paginate }: IQueryTopArgs) {
    const [items, totalCount] = await Listing.findAndCount({
      take: (paginate && paginate.limit) || 10,
      skip: paginate && paginate.offset,
      order: { createdAt: 'DESC' },
      relations: ['book'],
    });
    return { items, totalCount };
  },

  async me(_, args, { me }) {
    return me;
  },

  listing(_, { id }: IQueryListingArgs, { listingLoader }) {
    return listingLoader.load(id);
  },

  async searchGoogle(_, { query }: IQuerySearchGoogleArgs, { me }) {
    ensureUser(me);

    if (!query) {
      return;
    }
    return await searchBooks(query);
  },
  async googleBook(_, { id }: IQueryGoogleBookArgs, { me }) {
    ensureUser(me);

    const book = await getBook(id);
    if (!book) {
      throw new Error(`Book ${id} not found`);
    }
    return book;
  },

  async invites(_, args, { me }) {
    ensureAdmin(me);

    return Invite.find();
  },
};

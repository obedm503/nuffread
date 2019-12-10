import { Invite, Listing } from '../entities';
import { RecentListing } from '../entities/recent-listing.entity';
import {
  IListing,
  IQuery,
  IQueryBookArgs,
  IQueryGoogleBookArgs,
  IQueryListingArgs,
  IQuerySearchArgs,
  IQuerySearchGoogleArgs,
  IQueryTopArgs,
} from '../schema.gql';
import { logger, paginationOptions } from '../util';
import { ensureAdmin, ensureUser, userSession } from '../util/auth';
import { getBook, searchBooks } from '../util/google-books';
import { IResolver } from '../util/types';

export const QueryResolver: IResolver<IQuery> = {
  async search(_, { query, paginate }: IQuerySearchArgs) {
    const segments = query
      ?.toLowerCase()
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

    const { limit, offset } = paginationOptions(paginate);

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
    const { limit, offset } = paginationOptions(paginate);
    const [items, totalCount] = await Listing.findAndCount({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
      relations: ['book'],
    });
    return { items, totalCount };
  },

  async me(_, args, { getMe }) {
    return await getMe();
  },

  async listing(_, { id }: IQueryListingArgs, { listingLoader, session }) {
    const listing = await listingLoader.load(id);
    if (!listing) {
      return;
    }
    if (!session || !userSession(session)) {
      return (listing as any) as IListing;
    }

    if (listing.userId === session.userId) {
      // don't record me seeing my own listings
      return (listing as any) as IListing;
    }

    const partial = { listingId: id, userId: session.userId };
    const saved = await RecentListing.findOne({ where: partial });

    if (saved) {
      // update updated_at field
      await RecentListing.update(partial, partial);
    } else {
      await RecentListing.create(partial).save();
    }
    logger.debug({ partial }, 'recent listing');

    return (listing as any) as IListing;
  },

  async book(_, { id }: IQueryBookArgs, { bookLoader }) {
    return await bookLoader.load(id);
  },

  async searchGoogle(_, { query }: IQuerySearchGoogleArgs, { session }) {
    ensureUser(session);

    if (!query) {
      return;
    }
    return await searchBooks(query);
  },
  async googleBook(_, { id }: IQueryGoogleBookArgs, { session }) {
    ensureUser(session);

    const book = await getBook(id);
    if (!book) {
      throw new Error(`Book ${id} not found`);
    }
    return book;
  },

  async invites(_, args, { session }) {
    ensureAdmin(session);

    return Invite.find({ order: { createdAt: 'DESC' } });
  },
};

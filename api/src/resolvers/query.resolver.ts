import { getConnection } from 'typeorm';
import { Invite, Listing, School } from '../entities';
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
  ISession,
  SystemUserType,
} from '../schema.gql';
import { logger, paginationOptions } from '../util';
import { ensureAdmin, ensureUser, userSession } from '../util/auth';
import { InternalError } from '../util/error';
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

    const { take, skip } = paginationOptions(paginate);

    const builder = Listing.createQueryBuilder('listing')
      .innerJoinAndSelect('listing.book', 'book')
      // skip and take break with custom ORDER BY expression
      .limit(take)
      .offset(skip);

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      builder.setParameter(`segment_${i}`, segment);

      if (i === 0) {
        builder
          .where(`listing.search_text ~* :segment_${i}`)
          .orWhere(`book.search_text ~* :segment_${i}`);
      } else {
        builder
          .orWhere(`listing.search_text ~* :segment_${i}`)
          .orWhere(`book.search_text ~* :segment_${i}`);
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
    const { take, skip } = paginationOptions(paginate);
    const [items, totalCount] = await Listing.findAndCount({
      take,
      skip,
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

    return await Invite.find({ order: { createdAt: 'DESC' } });
  },
  async schools(_, __, { session }) {
    ensureAdmin(session);

    return await School.find({ order: { domain: 'ASC' } });
  },
  async sessions(_, __, { session, adminLoader, userLoader }) {
    ensureAdmin(session);

    const con = getConnection();
    type DBSession = {
      id: string;
      expires_at: Date;
      user_id: string;
      user_type: SystemUserType;
    };
    const dbSessions: DBSession[] = await con.query(
      `SELECT sid AS id, expire as expires_at, sess->>'userId' AS user_id, sess->>'userType' AS user_type FROM session`,
    );

    const sessions = await Promise.all(
      dbSessions.map<Promise<ISession>>(async s => {
        const user =
          s.user_type === SystemUserType.Admin
            ? await adminLoader.load(s.user_id)
            : await userLoader.load(s.user_id);

        if (!user) {
          logger.error({ id: s.user_id, type: s.user_type }, 'user not found');
          throw new InternalError();
        }

        return {
          id: s.id,
          expiresAt: s.expires_at,
          user,
        };
      }),
    );
    return sessions;
  },
};

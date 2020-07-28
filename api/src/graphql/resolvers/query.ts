import { Brackets, getConnection } from 'typeorm';
import { Book, Feature, RecentListing, School, User } from '../../db/entities';
import { logger } from '../../util';
import { getBook, searchBooks } from '../../util/google-books';
import { ensureAdmin, ensureUser, userSession } from '../auth';
import { InternalError } from '../error';
import { IQueryResolvers, ISession, SystemUserType } from '../schema.gql';
import { paginationOptions, sameSchoolListings } from '../util';

export const QueryResolver: IQueryResolvers = {
  async searchBooks(_, { query, paginate }, { session, getMe }) {
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

    const builder = Book.createQueryBuilder('book').innerJoinAndSelect(
      'book.listings',
      'listing',
    );

    if (userSession(session)) {
      const me = await getMe();
      if (me instanceof User) {
        builder.innerJoin('listing.user', 'user', 'user.schoolId = :schoolId', {
          schoolId: me.schoolId,
        });
      }
    }

    builder
      .where('listing.soldAt IS NULL')
      // skip and take break with custom ORDER BY expression
      .limit(take)
      .offset(skip);

    builder.andWhere(
      new Brackets(subQuery => {
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          builder.setParameter(`segment_${i}`, segment);

          if (i === 0) {
            subQuery
              .where(`listing.search_text ~* :segment_${i}`)
              .orWhere(`book.search_text ~* :segment_${i}`);
          } else {
            subQuery
              .orWhere(`listing.search_text ~* :segment_${i}`)
              .orWhere(`book.search_text ~* :segment_${i}`);
          }
        }
      }),
    );

    builder.orderBy(
      `GREATEST(${segments
        .map((_, i) => {
          return `SIMILARITY(listing.search_text, :segment_${i})`;
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

  async search(_, { query, paginate }, { session, getMe }) {
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

    const builder = (await sameSchoolListings({ session, getMe }))
      .innerJoinAndSelect('listing.book', 'book')
      .where('listing.soldAt IS NULL')
      // skip and take break with custom ORDER BY expression
      .limit(take)
      .offset(skip);

    builder.andWhere(
      new Brackets(subQuery => {
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          builder.setParameter(`segment_${i}`, segment);

          if (i === 0) {
            subQuery
              .where(`listing.search_text ~* :segment_${i}`)
              .orWhere(`book.search_text ~* :segment_${i}`);
          } else {
            subQuery
              .orWhere(`listing.search_text ~* :segment_${i}`)
              .orWhere(`book.search_text ~* :segment_${i}`);
          }
        }
      }),
    );

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

  async top(_, { paginate }, { session, getMe }) {
    const { take, skip } = paginationOptions(paginate);

    const query = await sameSchoolListings({ session, getMe });
    const [items, totalCount] = await query
      .where('listing.soldAt IS NULL')
      .orderBy('listing.created_at', 'DESC')
      .innerJoinAndSelect('listing.book', 'book')
      .limit(take)
      .offset(skip)
      .getManyAndCount();

    return { items, totalCount };
  },

  async me(_, {}, { getMe }) {
    return await getMe();
  },

  async listing(_, { id }, { listingLoader, session }) {
    const listing = await listingLoader().load(id);
    if (!listing) {
      return;
    }
    if (!session || !userSession(session)) {
      return listing;
    }

    if (listing.userId === session.userId) {
      // don't record me seeing my own listings
      return listing;
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

    return listing;
  },

  async book(_, { id }, { bookLoader }) {
    return await bookLoader().load(id);
  },

  async searchGoogle(_, { query }, { session }) {
    ensureUser(session);

    if (!query) {
      return;
    }
    return await searchBooks(query);
  },
  async googleBook(_, { id }, { session }) {
    ensureUser(session);

    const book = await getBook(id);
    if (!book) {
      throw new Error(`Book ${id} not found`);
    }
    return book;
  },

  async users(_, {}, { session }) {
    ensureAdmin(session);

    return await User.find({ order: { createdAt: 'DESC' } });
  },
  async schools(_, {}, { session }) {
    ensureAdmin(session);

    return await School.find({ order: { domain: 'ASC' } });
  },
  async sessions(_, {}, { session, adminLoader, userLoader }) {
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
            ? await adminLoader().load(s.user_id)
            : await userLoader().load(s.user_id);

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

  async thread(_, { id }, { threadLoader }) {
    return threadLoader().load(id);
  },

  async features(_, {}, { session }) {
    ensureAdmin(session);

    return await Feature.find();
  },
};

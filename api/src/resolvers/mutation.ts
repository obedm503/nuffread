import { compare, hash } from 'bcryptjs';
import * as crypto from 'crypto';
import { Brackets, getConnection } from 'typeorm';
import { promisify } from 'util';
import { CONFIG } from '../config';
import {
  Admin,
  Book,
  Listing,
  Message,
  RecentListing,
  SavedListing,
  School,
  Thread,
  User,
} from '../entities';
import { IGoogleBook, IMutationResolvers, SystemUserType } from '../schema.gql';
import { jwt, logger } from '../util';
import { ensureAdmin, ensurePublic, ensureUser, isUser } from '../util/auth';
import { send } from '../util/email';
import {
  AuthorizationError,
  BadRequest,
  BookNotFound,
  DuplicateUser,
  ListingNotFound,
  NotConfirmed,
  ThreadNotFound,
  WrongCredentials,
} from '../util/error';
import { getBook } from '../util/google-books';
import { subscriptions } from '../util/pubsub';
import { Session } from '../util/types';

const randomBytes = promisify(crypto.randomBytes);
async function generateConfirmCode(): Promise<string> {
  const buffer = await randomBytes(48);
  return buffer.toString('hex');
}

function cleanEmail(email: string): string {
  return email.toLowerCase().trim();
}

function login(id: string, type: SystemUserType, session?: Session) {
  if (!session) {
    throw new Error('no session');
  }

  session.userId = id;
  session.userType = type;
}

export const sendConfirmationEmail = async ({
  email,
  confirmCode,
}: {
  email: string;
  confirmCode: string;
}) => {
  const link = `${CONFIG.origin}/join/${confirmCode}`;
  await send({
    email,
    subject: 'Finish the signup process',
    html: `Click the <a href="${link}">link</a> to confirm your email. <br /><br /> ${link}`,
  });
};

function getThumbnail(gBook: IGoogleBook, coverIndex: number): string {
  const cover = gBook.possibleCovers[coverIndex];
  if (!cover) {
    throw new BadRequest();
  }
  return cover;
}

export const MutationResolver: IMutationResolvers = {
  async register(
    _,
    { email: emailInput, password },
    { userEmailLoader, session },
  ) {
    ensurePublic(session);
    const email = cleanEmail(emailInput);

    // validate email and password
    await User.validateEmailPassword({ email, password });

    // email already exists
    if (await userEmailLoader().load(email)) {
      throw new DuplicateUser();
    }

    const passwordHash = await hash(password, 12);

    const [username, domain] = email.split('@');

    const [foundSchool, confirmCode] = await Promise.all([
      School.findOne({ where: { domain } }),
      generateConfirmCode(),
    ]);

    const user: User = await getConnection().transaction(async manager => {
      let school = foundSchool;
      if (!school) {
        // school doesn't yet exist
        // create it and default name to ''
        school = await manager.save(School.create({ domain, name: '' }));
      }
      return await manager.save(
        User.create({
          name: username,
          email,
          passwordHash,
          school,
          confirmCode,
        }),
      );
    });

    await sendConfirmationEmail({ email, confirmCode: confirmCode! });

    return user;
  },

  async resendConfirmEmail(
    _,
    { email: emailInput },
    { session, userEmailLoader },
  ) {
    ensureAdmin(session);

    const email = cleanEmail(emailInput);

    const user = await userEmailLoader().load(email);
    if (!user) {
      throw new WrongCredentials();
    }

    if (user.confirmedAt || !user.confirmCode) {
      return true; // user is already confirmed
    }

    await sendConfirmationEmail({ email, confirmCode: user.confirmCode });

    return true;
  },

  async confirm(_, { code }, { session }) {
    ensurePublic(session);

    return await getConnection().transaction(async manager => {
      const user = await manager.findOne(User, {
        where: { confirmCode: code },
      });
      if (!user) {
        throw new WrongCredentials();
      }

      if (user.confirmedAt) {
        return true; // user is already confirmed
      }

      user.confirmedAt = new Date();
      user.confirmCode = undefined;
      await manager.save(user);

      // automatically log in
      login(user.id, SystemUserType.User, session);

      return true;
    });
  },

  async login(_, { email: emailInput, password, type }, { session }) {
    let Ent: typeof Admin | typeof User;
    if (type === SystemUserType.User) {
      Ent = User;
    } else if (type === SystemUserType.Admin) {
      Ent = Admin;
    } else {
      throw new BadRequest();
    }

    const email = cleanEmail(emailInput);
    const me = await Ent.findOne({ where: { email } });

    if (!me) {
      throw new WrongCredentials();
    }

    if (me instanceof User && !me.confirmedAt) {
      throw new NotConfirmed();
    }

    if (!(await compare(password, me.passwordHash))) {
      throw new WrongCredentials();
    }

    login(me.id, type, session);

    return me;
  },

  async logout(_, {}, { res, session }) {
    if (session) {
      const destroy = promisify(session.destroy.bind(session));
      await destroy();
    }
    res?.clearCookie('session');

    return true;
  },

  async requestResetPassword(
    _,
    { email: emailInput },
    { session, userEmailLoader },
  ) {
    ensurePublic(session);

    const email = cleanEmail(emailInput);
    const user = await userEmailLoader().load(email);
    if (!isUser(user)) {
      return true; // email doens't exist, but don't tell the client
    }

    // can be called multiple times, but only the last request will be valid
    const token = await jwt.sign({ email }, { expiresIn: '15 min' });
    user.passwordResetToken = token;

    const sentEmail = send({
      email,
      subject: 'Reset your password',
      html: `To reset your password, click the link below.
      <br/>
      If you did not request to change your password, simply ignore this email.

      <a href="${CONFIG.origin}/reset/${token}">https://www.nuffread.com/reset/${token}</a>
    `,
    });
    await Promise.all([user.save(), sentEmail]);

    return true;
  },

  async resetPassword(_, { token, password }, { session }) {
    ensurePublic(session);

    const user = await User.findOne({ where: { passwordResetToken: token } });
    if (!isUser(user)) {
      throw new WrongCredentials();
    }

    try {
      await jwt.verify(token); // verify token is not expired
    } catch (e) {
      logger.error(e, { email: user.email });

      // token is expired, delete it
      user.passwordResetToken = undefined;
      await user.save();

      throw new WrongCredentials();
    }

    user.passwordHash = await hash(password, 12);
    user.passwordResetToken = undefined;
    await user.save();

    // automatically log in
    login(user.id, SystemUserType.User, session);

    return true;
  },

  async setSchoolName(_, { id, name }, { session }) {
    ensureAdmin(session);

    const school = await School.findOneOrFail({ where: { id } });
    school.name = name;
    return await school.save();
  },

  async createListing(
    _,
    { listing: { googleId, price, description, coverIndex, condition } },
    { getMe, session },
  ) {
    ensureUser(session);

    return await getConnection().transaction(async manager => {
      let [book, gBook] = await Promise.all([
        manager.findOne(Book, { where: { googleId } }),
        getBook(googleId),
      ]);

      // allow users to pick cover image
      // it does modify the shared Book amongst all the listings
      // client sends an index, it cannot be trusted to send the correct url
      if (typeof coverIndex !== 'number') {
        // coverIndex is optional for backwards compat reasons
        logger.info('createListing: user did not provide coverIndex');
        coverIndex = 0;
      }

      if (book) {
        const cover = gBook && getThumbnail(gBook, coverIndex);
        if (cover && book.thumbnail !== cover) {
          // cover image changed
          book.thumbnail = cover;
          book = await manager.save(book);
        }
      } else {
        if (!gBook) {
          throw new BookNotFound();
        }
        const cover = getThumbnail(gBook, coverIndex);
        book = await manager.save(Book.create({ ...gBook, thumbnail: cover }));
      }

      const listing = await manager.save(
        Listing.create({
          book,
          price,
          user: await getMe(),
          description,
          condition,
        }),
      );
      return listing;
    });
  },
  async deleteListing(_, { id }, { getMe, listingLoader, session }) {
    ensureUser(session);

    const [me, listing] = await Promise.all([
      getMe(),
      listingLoader().load(id),
    ]);
    if (!me) {
      throw new AuthorizationError();
    }
    if (!listing) {
      throw new ListingNotFound({ id, session });
    }
    if (listing.userId !== me.id) {
      throw new AuthorizationError();
    }

    await getConnection().transaction(async manager => {
      const listingId = id;
      const threads = await manager.find(Thread, { where: { listingId } });
      const threadIds = threads.map(t => t.id);
      await manager.query(
        `DELETE FROM "message" WHERE "thread_id" IN (${threadIds
          // creates ($1, $2, $3, ...)
          .map((id, n) => `$${n + 1}`)
          .join(', ')})`,
        // always escape variables
        threadIds,
      );
      await manager.delete(Thread, { listingId });
      await manager.delete(RecentListing, { listingId });
      await manager.delete(SavedListing, { listingId });
      await manager.delete(Listing, { id });
    });

    return true;
  },

  async saveListing(_, { listingId, saved }, { session, listingLoader }) {
    ensureUser(session);

    if (saved) {
      await SavedListing.create({
        listingId,
        userId: session.userId,
      }).save();
    } else {
      await SavedListing.delete({ listingId, userId: session.userId });
    }

    return (await listingLoader().load(listingId))!;
  },

  async sellListing(_, { listingId, price }, { session, listingLoader }) {
    ensureUser(session);

    const listing = await listingLoader().load(listingId);
    if (!listing) {
      throw new ListingNotFound({ id: listingId, session });
    }
    if (listing.soldAt) {
      return listing;
    }

    listing.soldAt = new Date();
    listing.soldPrice = price;

    return await listing.save();
  },

  async setPrice(_, { listingId, price }, { session, listingLoader }) {
    ensureUser(session);

    const listing = await listingLoader().load(listingId);
    if (!listing) {
      throw new ListingNotFound({ id: listingId, session });
    }
    if (listing.soldAt) {
      throw new BadRequest();
    }
    if (listing.price === price) {
      return listing;
    }

    listing.price = price;

    return await listing.save();
  },

  async toggleUserTrackable(_, {}, { session, userLoader }) {
    ensureUser(session);

    const user = await userLoader().load(session.userId);
    if (!user) {
      throw new WrongCredentials();
    }
    user.isTrackable = !user.isTrackable;
    return await user.save();
  },

  async startThread(_, { listingId }, { session, listingLoader }) {
    ensureUser(session);
    const curUserId = session.userId;

    const listing = await listingLoader().load(listingId);
    if (!listing) {
      throw new ListingNotFound({ id: listingId, session });
    }

    const otherUserId = listing.userId;
    if (curUserId === otherUserId) {
      throw new BadRequest();
    }

    let thread = await Thread.createQueryBuilder('thread')
      .setParameters({ listingId, curUserId, otherUserId })
      .where('thread.listingId = :listingId')
      .andWhere(
        new Brackets(subQuery => {
          subQuery
            .where(
              new Brackets(subSubQuery =>
                subSubQuery
                  .where('thread.buyerId = :curUserId')
                  .andWhere('thread.sellerId = :otherUserId'),
              ),
            )
            .orWhere(
              new Brackets(subSubQuery =>
                subSubQuery
                  .where('thread.buyerId = :otherUserId')
                  .andWhere('thread.sellerId = :curUserId'),
              ),
            );
        }),
      )
      .getOne();

    if (!thread) {
      const sellerId = listing.userId;
      const buyerId = sellerId === curUserId ? otherUserId : curUserId;
      thread = await Thread.create({
        sellerId,
        buyerId,
        listingId,
        lastMessageAt: new Date(),
      }).save();
    }

    return thread;
  },
  async sendMessage(_, { threadId, content }, { session, threadLoader }) {
    ensureUser(session);
    const fromUserId = session.userId;

    const thread = await threadLoader().load(threadId);
    if (!thread) {
      throw new ThreadNotFound({ id: threadId, session });
    }

    const toUserId =
      fromUserId === thread.buyerId ? thread.sellerId : thread.buyerId;

    // instead of an expensive subquery on the messages keep track of when the
    // last message was sent. saves a db query when ordering the threads
    const now = new Date();
    thread.lastMessageAt = now;
    await thread.save();

    const msg = await Message.create({
      createdAt: now,
      threadId: thread.id,
      fromId: session.userId,
      toId: toUserId,
      content,
    }).save();
    // notify subscriptions
    await subscriptions.newMessage(msg);
    return msg;
  },
};

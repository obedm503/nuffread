import { compare, hash } from 'bcryptjs';
import { getConnection } from 'typeorm';
import { CONFIG } from '../config';
import {
  Admin,
  Book,
  Invite,
  Listing,
  RecentListing,
  SavedListing,
  School,
  User,
} from '../entities';
import { IGoogleBook, IMutationResolvers } from '../schema.gql';
import { jwt, logger } from '../util';
import { ensureAdmin, ensurePublic, ensureUser, isUser } from '../util/auth';
import { send } from '../util/email';
import {
  AuthorizationError,
  BadRequest,
  BookNotFound,
  DuplicateInvite,
  DuplicateUser,
  NoApprovedInvite,
  NoInvite,
  NotConfirmed,
  WrongCredentials,
} from '../util/error';
import { getBook } from '../util/google-books';

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

function ensureInvited(invite?: Invite): asserts invite is Invite {
  if (!invite) {
    throw new NoInvite();
  }
  if (!invite.invitedAt) {
    throw new NoApprovedInvite();
  }
}
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
    { inviteLoader, userEmailLoader, session },
  ) {
    ensurePublic(session);
    const email = emailInput.toLowerCase();

    // validate email and password
    await User.validateEmailPassword({ email, password });

    // email already exists
    if (await userEmailLoader.load(email)) {
      throw new DuplicateUser();
    }

    const invite = await inviteLoader.load(email);
    // only invited users can register
    ensureInvited(invite);

    const passwordHash = await hash(password, 12);

    const domain = email.split('@')[1];
    let school = await School.findOne({ where: { domain } });

    const user: User = await getConnection().transaction(async manager => {
      if (!school) {
        // school doesn't yet exist
        // create it and default name to ''
        school = await manager.save(School.create({ domain, name: '' }));
      }
      return await manager.save(
        User.create({ name: invite.name, email, passwordHash, school }),
      );
    });

    await sendConfirmationEmail({
      email: user.email,
      confirmCode: invite.code,
    });

    return user;
  },

  async login(_, { email: emailInput, password, type }, { req }) {
    let Ent: typeof Admin | typeof User;
    if (type === 'USER') {
      Ent = User;
    } else if (type === 'ADMIN') {
      Ent = Admin;
    } else {
      throw new BadRequest();
    }

    const email = emailInput.toLowerCase();
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

    if (req.session) {
      req.session.userId = me.id;
      req.session.userType = type;
    }

    return me;
  },
  async logout(_, {}, { req, res }) {
    const session = req.session;
    if (session) {
      await new Promise(done => session.destroy(done));
    }
    res.clearCookie('session');

    return true;
  },
  async confirm(_, { code }, { session }) {
    ensurePublic(session);

    return await getConnection().transaction(async manager => {
      const invite = await manager.findOne(Invite, {
        where: { code },
      });
      ensureInvited(invite);

      const user = await manager.findOne(User, {
        where: { email: invite.email },
      });
      if (!user) {
        throw new WrongCredentials();
      }

      if (user.confirmedAt) {
        return true; // user is already confirmed
      }

      user.confirmedAt = new Date();
      await manager.save(user);

      return true;
    });
  },
  async resendConfirmEmail(
    _,
    { email: emailInput },
    { session, inviteLoader, userEmailLoader },
  ) {
    ensureAdmin(session);

    const email = emailInput.toLowerCase();

    const invite = await inviteLoader.load(email);
    ensureInvited(invite);

    const user = await userEmailLoader.load(email);
    if (!user) {
      throw new WrongCredentials();
    }

    if (user.confirmedAt) {
      return true; // user is already confirmed
    }

    await sendConfirmationEmail({ email, confirmCode: invite.code });

    return true;
  },
  async createListing(
    _,
    { listing: { googleId, price, description, coverIndex } },
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
        }),
      );
      return listing;
    });
  },
  async deleteListing(_, { id }, { getMe, listingLoader, session }) {
    ensureUser(session);

    const [me, listing] = await Promise.all([getMe(), listingLoader.load(id)]);
    if (!listing || !me || listing.userId !== me.id) {
      throw new AuthorizationError();
    }

    await getConnection().transaction(async manager => {
      await manager.delete(RecentListing, { listingId: id });
      await manager.delete(SavedListing, { listingId: id });
      await manager.delete(Listing, { id });
    });

    return true;
  },
  async requestInvite(
    _,
    { email: emailInput, name },
    { session, inviteLoader },
  ) {
    ensurePublic(session);

    const email = emailInput.toLowerCase();
    if (await inviteLoader.load(email)) {
      throw new DuplicateInvite();
    }

    const invite = Invite.create({ email, name });
    const admins = await Admin.find();
    const sentEmail = Promise.all(
      admins.map(admin =>
        send({
          email: admin.email,
          subject: 'New invite request',
          html: [
            `${name} (${email}) has requested an invite.`,
            `Go to <a href="${CONFIG.origin}/admin">https://www.nuffread.com/admin</a> to authorize it.`,
          ].join(' '),
        }),
      ),
    );
    await Promise.all([invite.save(), sentEmail]);

    return true;
  },
  async sendInvite(_, { email: emailInput }, { session, inviteLoader }) {
    ensureAdmin(session);

    const email = emailInput.toLowerCase();
    const invite = await inviteLoader.load(email);
    if (!invite) {
      throw new NoInvite();
    }
    invite.invitedAt = new Date();
    const sentEmail = send({
      email,
      subject: 'Welcome to Nuffread',
      html: `Your request has been approved. Go to <a href="${CONFIG.origin}/join">https://www.nuffread.com/join</a> and go through the standard signup process.
    `,
    });
    const [savedInvite] = await Promise.all([invite.save(), sentEmail]);
    return savedInvite;
  },

  async requestResetPassword(
    _,
    { email: emailInput },
    { session, userEmailLoader },
  ) {
    ensurePublic(session);

    const email = emailInput.toLowerCase();
    const user = await userEmailLoader.load(email);
    if (!isUser(user)) {
      return true; // email doens't exist, but don't tell the client
    }

    // can be called multiple times, but only the last request will be valid
    const token = await jwt.sign({ email }, { expiresIn: '2h' });
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

    return true;
  },

  async setSchoolName(_, { id, name }, { session }) {
    ensureAdmin(session);

    const school = await School.findOneOrFail({ where: { id } });
    school.name = name;
    return await school.save();
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

    return (await listingLoader.load(listingId))!;
  },

  async toggleUserTrackable(_, {}, { session, userLoader }) {
    ensureUser(session);

    const user = await userLoader.load(session.userId);
    if (!user) {
      throw new WrongCredentials();
    }
    user.isTrackable = !user.isTrackable;
    return await user.save();
  },
};

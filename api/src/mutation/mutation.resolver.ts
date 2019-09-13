import { ApolloError } from 'apollo-server-core';
import { compare, hash } from 'bcryptjs';
import { getConnection } from 'typeorm';
import { Admin } from '../admin/admin.entity';
import { Book } from '../book/book.entity';
import { Invite } from '../invite/invite.entity';
import { Listing } from '../listing/listing.entity';
import {
  IConfirmOnMutationArguments,
  ICreateListingOnMutationArguments,
  ILoginOnMutationArguments,
  IMutation,
  IRegisterOnMutationArguments,
  IRequestInviteOnMutationArguments,
  IResendEmailOnMutationArguments,
} from '../schema.gql';
import { sendConfirmationEmail, User } from '../user/user.entity';
import { AuthenticationError, isUser, isAdmin, isPublic } from '../util/auth';
import { getBook } from '../util/books';
import { IResolver } from '../util/types';
import { send } from '../util/email';

export const MutationResolver: IResolver<IMutation> = {
  async register(
    _,
    { email, password }: IRegisterOnMutationArguments,
    { req, me },
  ) {
    isPublic(me);

    const origin = req.get('origin');
    if (!origin) {
      throw new ApolloError('BAD_REQUEST');
    }

    // email already exists
    if (await User.findOne({ where: { email } })) {
      throw new AuthenticationError('DUPLICATE_USER');
    }

    const invite = await Invite.findOne({ where: { email } });
    // only invited users can register
    if (!invite) {
      throw new AuthenticationError('NO_INVITE');
    }

    const passwordHash = await hash(password, 12);

    const user = User.create({ email, passwordHash });
    await User.save(user);

    await sendConfirmationEmail(origin, {
      email: user.email,
      confirmCode: invite.code,
    });

    return true;
  },

  async login(
    _,
    { email, password, type }: ILoginOnMutationArguments,
    { req },
  ) {
    let Ent: typeof Admin | typeof User;
    if (type === 'USER') {
      Ent = User;
    } else if (type === 'ADMIN') {
      Ent = Admin;
    } else {
      throw new AuthenticationError('INVALID_TYPE');
    }

    const me = await Ent.findOne({ where: { email } });

    if (!me) {
      throw new AuthenticationError('WRONG_CREDENTIALS');
    }

    if (me instanceof User && !me.confirmedAt) {
      throw new AuthenticationError('NOT_CONFIRMED');
    }

    if (!(await compare(password, me.passwordHash))) {
      throw new AuthenticationError('WRONG_CREDENTIALS');
    }

    if (req.session) {
      req.session.userId = me.id;
      req.session.userType = type;
    }

    return true;
  },
  async logout(_, args, { req, res }) {
    if (req.session) {
      await new Promise(done => req.session!.destroy(done));
    }
    res.clearCookie('session');

    return true;
  },
  async confirm(_, { code }: IConfirmOnMutationArguments, { me }) {
    isPublic(me);

    return await getConnection().transaction(async manager => {
      const invite = await manager.findOne(Invite, {
        where: { code },
      });
      if (!invite) {
        throw new AuthenticationError('NO_INVITE');
      }

      const user = await manager.findOne(User, {
        where: { email: invite.email },
      });
      if (!user) {
        throw new AuthenticationError('WRONG_CREDENTIALS');
      }

      user.confirmedAt = new Date();
      await manager.save(user);

      return true;
    });
  },
  async resendEmail(
    _,
    { email }: IResendEmailOnMutationArguments,
    { me, req },
  ) {
    isPublic(me);
    if (me) {
      // is already logged in, no need to resend
      throw new AuthenticationError('BAD_REQUEST');
    }

    const origin = req.get('origin');
    if (!origin) {
      throw new ApolloError('BAD_REQUEST');
    }

    const invite = await Invite.findOne({
      where: { email },
    });
    if (!invite) {
      throw new AuthenticationError('NO_INVITE');
    }

    await sendConfirmationEmail(origin, { email, confirmCode: invite.code });

    return true;
  },
  async createListing(
    _,
    {
      listing: { googleId, price, schoolId },
    }: ICreateListingOnMutationArguments,
    { me },
  ) {
    isUser(me);

    return await getConnection().transaction(async manager => {
      let book = await manager.findOne(Book, { where: { googleId } });
      if (!book) {
        const gBook = await getBook(googleId);
        if (!gBook) {
          throw new ApolloError('Google Book not found');
        }
        book = await manager.save(Book.create(gBook));
      }
      const listing = await manager.save(
        Listing.create({
          book,
          price,
          user: me,
          schoolId,
        }),
      );
      return listing;
    });
  },
  async requestInvite(
    _,
    { email, name }: IRequestInviteOnMutationArguments,
    { me },
  ) {
    isPublic(me);

    if (await Invite.findOne({ where: { email } })) {
      throw new ApolloError('DUPLICATE_INVITE');
    }

    const invite = Invite.create({ email, name });
    await invite.save();
    return true;
  },
  async sendInvite(_, { email }, { me }) {
    isAdmin(me);

    const invite = await Invite.findOne({ where: { email } });
    if (!invite) {
      throw new ApolloError('Invite not found', 'INVALID_CREDENTIALS');
    }
    invite.invitedAt = new Date();
    const sentEmail = send({
      email,
      subject: 'Welcome to Nuffread',
      html: `Your request has been approved. Go to <a href="https://www.nuffread.com/join">nuffread.com/join</a> and go through the standard signup process.
    `,
    });
    const [savedInvite] = await Promise.all([invite.save(), sentEmail]);
    return savedInvite;
  },
};

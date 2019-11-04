import { compare, hash } from 'bcryptjs';
import { getConnection } from 'typeorm';
import { CONFIG } from '../config';
import { Admin, Book, Invite, Listing, User } from '../entities';
import {
  IMutation,
  IMutationConfirmArgs,
  IMutationCreateListingArgs,
  IMutationDeleteListingArgs,
  IMutationLoginArgs,
  IMutationRegisterArgs,
  IMutationRequestInviteArgs,
  IMutationRequestResetPasswordArgs,
  IMutationResetPasswordArgs,
  IMutationSendInviteArgs,
  IUser,
} from '../schema.gql';
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
import { IResolver } from '../util/types';

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

const isInvited = (invite?: Invite) => {
  if (!invite) {
    throw new NoInvite();
  }
  if (!invite.invitedAt) {
    throw new NoApprovedInvite();
  }
};

export const MutationResolver: IResolver<IMutation> = {
  async register(
    _,
    { email: emailInput, password }: IMutationRegisterArgs,
    { req, me, inviteLoader },
  ) {
    ensurePublic(me);
    const email = emailInput.toLowerCase();

    // email already exists
    if (await User.findOne({ where: { email } })) {
      throw new DuplicateUser();
    }

    const invite = await inviteLoader.load(email);
    // only invited users can register
    isInvited(invite);

    const passwordHash = await hash(password, 12);

    const user = await User.save(User.create({ email, passwordHash }));

    await sendConfirmationEmail({
      email: user.email,
      confirmCode: invite!.code,
    });

    return user;
  },

  async login(
    _,
    { email: emailInput, password, type }: IMutationLoginArgs,
    { req },
  ) {
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
  async logout(_, args, { req, res }) {
    if (req.session) {
      await new Promise(done => req.session!.destroy(done));
    }
    res.clearCookie('session');

    return true;
  },
  async confirm(_, { code }: IMutationConfirmArgs, { me }) {
    ensurePublic(me);

    return await getConnection().transaction(async manager => {
      const invite = await manager.findOne(Invite, {
        where: { code },
      });
      isInvited(invite);

      const user = await manager.findOne(User, {
        where: { email: invite!.email },
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
  // async resendEmail(_, { code }: IResendEmailOnMutationArguments, { me, req }) {
  //   // is already logged in, no need to resend
  //   isPublic(me);

  //   const invite = await Invite.findOne({
  //     where: { code },
  //   });
  //   isInvited(invite);

  //   await sendConfirmationEmail(config.origin, {
  //     email: invite!.email,
  //     confirmCode: invite!.code,
  //   });

  //   return true;
  // },
  async createListing(
    _,
    { listing: { googleId, price, description } }: IMutationCreateListingArgs,
    { me },
  ) {
    ensureUser(me);

    return await getConnection().transaction(async manager => {
      let book = await manager.findOne(Book, { where: { googleId } });
      if (!book) {
        const gBook = await getBook(googleId);
        if (!gBook) {
          throw new BookNotFound();
        }
        book = await manager.save(Book.create(gBook));
      }
      const listing = await manager.save(
        Listing.create({
          book,
          price,
          user: me,
          description,
        }),
      );
      return listing;
    });
  },
  async deleteListing(
    _,
    { id }: IMutationDeleteListingArgs,
    { me, listingLoader },
  ) {
    if (!ensureUser(me)) {
      return false;
    }

    const listing = await listingLoader.load(id);
    if (!listing || listing.userId !== me.id) {
      throw new AuthorizationError();
    }

    await Listing.delete({ id });

    return true;
  },
  async requestInvite(
    _,
    { email: emailInput, name }: IMutationRequestInviteArgs,
    { me, inviteLoader, req },
  ) {
    ensurePublic(me);

    const email = emailInput.toLowerCase();
    if (await inviteLoader.load(email)) {
      throw new DuplicateInvite();
    }

    const invite = Invite.create({ email, name });
    const sentEmail = send({
      email: 'obedm503@gmail.com',
      subject: 'New invite request',
      html: [
        `${name} (${email}) has requested an invite.`,
        `Go to <a href="${CONFIG.origin}/admin">https://www.nuffread.com/admin</a> to authorize it.`,
      ].join(' '),
    });
    await Promise.all([invite.save(), sentEmail]);

    return true;
  },
  async sendInvite(
    _,
    { email: emailInput }: IMutationSendInviteArgs,
    { me, inviteLoader, req },
  ) {
    ensureAdmin(me);

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
    { email: emailInput }: IMutationRequestResetPasswordArgs,
    { me },
  ) {
    ensurePublic(me);

    const email = emailInput.toLowerCase();
    const user = await User.findOne({ where: { email } });
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
  async resetPassword(
    _,
    { token, password }: IMutationResetPasswordArgs,
    { me },
  ) {
    ensurePublic(me);

    const user = await User.findOne({ where: { passwordResetToken: token } });
    if (!isUser(user)) {
      throw new WrongCredentials();
    }

    try {
      await jwt.verify(token); // verify token is not expired
    } catch (e) {
      // token is expired, delete it
      user.passwordResetToken = undefined;
      await user.save();

      logger.error(e, { email: user.email });
      throw new WrongCredentials();
    }

    user.passwordHash = await hash(password, 12);
    user.passwordResetToken = undefined;
    await user.save();

    return true;
  },
};

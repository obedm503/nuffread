import { compare, hash } from 'bcryptjs';
import { getConnection } from 'typeorm';
import { Admin, Book, Invite, Listing, User } from '../entities';
import {
  IConfirmOnMutationArguments,
  ICreateListingOnMutationArguments,
  IDeleteListingOnMutationArguments,
  ILoginOnMutationArguments,
  IMutation,
  IRegisterOnMutationArguments,
  IRequestInviteOnMutationArguments,
} from '../schema.gql';
import { isAdmin, isPublic, isUser } from '../util/auth';
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

export const sendConfirmationEmail = async (
  base: string,
  { email, confirmCode }: { email: string; confirmCode: string },
) => {
  const link = `${base}/join/${confirmCode}`;
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
    { email, password }: IRegisterOnMutationArguments,
    { req, me, inviteLoader },
  ) {
    isPublic(me);

    const origin = req.get('origin');
    if (!origin) {
      throw new BadRequest();
    }

    // email already exists
    if (await User.findOne({ where: { email } })) {
      throw new DuplicateUser();
    }

    const invite = await inviteLoader.load(email);
    // only invited users can register
    isInvited(invite);

    const passwordHash = await hash(password, 12);

    const user = User.create({ email, passwordHash });
    await User.save(user);

    await sendConfirmationEmail(origin, {
      email: user.email,
      confirmCode: invite!.code,
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
      throw new BadRequest();
    }

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

  //   const origin = req.get('origin');
  //   if (!origin) {
  //     throw new BadRequest();
  //   }

  //   const invite = await Invite.findOne({
  //     where: { code },
  //   });
  //   isInvited(invite);

  //   await sendConfirmationEmail(origin, {
  //     email: invite!.email,
  //     confirmCode: invite!.code,
  //   });

  //   return true;
  // },
  async createListing(
    _,
    {
      listing: { googleId, price, description },
    }: ICreateListingOnMutationArguments,
    { me },
  ) {
    isUser(me);

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
    { id }: IDeleteListingOnMutationArguments,
    { me, listingLoader },
  ) {
    if (!isUser(me)) {
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
    { email, name }: IRequestInviteOnMutationArguments,
    { me, inviteLoader },
  ) {
    isPublic(me);

    if (await inviteLoader.load(email)) {
      throw new DuplicateInvite();
    }

    const invite = Invite.create({ email, name });
    const sentEmail = send({
      email: 'obedm503@gmail.com',
      subject: 'New invite request',
      html: [
        `${name} (${email}) has requested an invite.`,
        'Go to <a href="https://www.nuffread.com/admin">nuffread.com/admin</a> to authorize it.',
      ].join(' '),
    });
    await Promise.all([invite.save(), sentEmail]);

    return true;
  },
  async sendInvite(_, { email }, { me, inviteLoader }) {
    isAdmin(me);

    const invite = await inviteLoader.load(email);
    if (!invite) {
      throw new NoInvite();
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

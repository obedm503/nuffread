const atob = require('atob');
const btoa = require('btoa');
import { ApolloError } from 'apollo-server-core';
import { compare, hash } from 'bcryptjs';
import { Admin } from '../admin/admin.entity';
import {
  IConfirmOnMutationArguments,
  ILoginOnMutationArguments,
  IMutation,
  IRegisterOnMutationArguments,
  IResendEmailOnMutationArguments,
} from '../schema.gql';
import { User, sendConfirmationEmail } from '../user/user.entity';
import { validate } from '../util';
import { AuthenticationError, isUser } from '../util/auth';
import { IResolver } from '../util/types';

export const MutationResolver: IResolver<IMutation> = {
  async register(
    _,
    { email, password }: IRegisterOnMutationArguments,
    { req },
  ) {
    const origin = req.get('origin');
    if (!origin) {
      throw new ApolloError('BAD_REQUEST');
    }
    if (await User.findOne({ where: { email } })) {
      throw new AuthenticationError('DUPLICATE_USER');
    }

    const passwordHash = await hash(password, 12);

    const user = User.create({ email, passwordHash });
    await validate(user);
    await User.save(user);

    await sendConfirmationEmail(origin, user.id, user.email);

    // return id in binary
    return btoa(user.id);
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
  async confirm(_, { id: binId }: IConfirmOnMutationArguments) {
    const id = atob(binId);
    const user = await User.findOne({ where: { id } });

    if (!user) {
      throw new AuthenticationError('WRONG_CREDENTIALS');
    }

    user.confirmedAt = new Date();
    await User.save(user);

    return true;
  },
  async resendEmail(
    _,
    { binId, email }: IResendEmailOnMutationArguments,
    { me, req },
  ) {
    if (me) {
      // is already logged in, no need to resend
      return btoa(me.id);
    }

    const origin = req.get('origin');
    if (!origin) {
      throw new ApolloError('BAD_REQUEST');
    }

    if (!email && !binId) {
      throw new ApolloError('BAD_REQUEST');
    }

    const user = email
      ? await User.findOne({ where: { email } })
      : await User.findOne({ where: { id: atob(binId) } });

    if (!isUser(user)) {
      return '';
    }

    if (user.confirmedAt) {
      return btoa(user.id);
    }

    await sendConfirmationEmail(origin, user.id, user.email);

    return btoa(user.id);
  },
};

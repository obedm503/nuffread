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
import { Seller, sendConfirmationEmail } from '../seller/seller.entity';
import { validate } from '../util';
import { AuthenticationError, isSeller } from '../util/auth';
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
    if (await Seller.findOne({ where: { email } })) {
      throw new AuthenticationError('DUPLICATE_USER');
    }

    const passwordHash = await hash(password, 12);

    const seller = Seller.create({ email, passwordHash });
    await validate(seller);
    await Seller.save(seller);

    await sendConfirmationEmail(origin, seller.id, seller.email);

    // return id in binary
    return btoa(seller.id);
  },

  async login(
    _,
    { email, password, type }: ILoginOnMutationArguments,
    { req },
  ) {
    let Ent: typeof Admin | typeof Seller;
    if (type === 'SELLER') {
      Ent = Seller;
    } else if (type === 'ADMIN') {
      Ent = Admin;
    } else {
      throw new AuthenticationError('INVALID_TYPE');
    }

    const me = await Ent.findOne({ where: { email } });

    if (!me) {
      throw new AuthenticationError('WRONG_CREDENTIALS');
    }

    if (me instanceof Seller && !me.confirmedAt) {
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
    const seller = await Seller.findOne({ where: { id } });

    if (!seller) {
      throw new AuthenticationError('WRONG_CREDENTIALS');
    }

    seller.confirmedAt = new Date();
    await Seller.save(seller);

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

    const seller = email
      ? await Seller.findOne({ where: { email } })
      : await Seller.findOne({ where: { id: atob(binId) } });

    if (!isSeller(seller)) {
      return '';
    }

    if (seller.confirmedAt) {
      return btoa(seller.id);
    }

    await sendConfirmationEmail(origin, seller.id, seller.email);

    return btoa(seller.id);
  },
};

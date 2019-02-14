import { compare, hash } from 'bcryptjs';
import { Request, Response } from 'express';
import { AuthErrors } from '../../shared/util';
import { Admin } from '../admin/admin.entity';
import { Seller } from '../seller/seller.entity';
import { validate } from '../util';
import { AuthenticationError } from '../util/auth';
import { IResolver } from '../util/types';
import { send } from '../util/email';
import { join } from 'path';
import { stringify } from 'querystring';

export async function logout(req: Request, res: Response) {
  if (req.session) {
    await new Promise(done => req.session!.destroy(done));
  }
  res.clearCookie('session');
}

export const MutationResolver: IResolver<GQL.IMutation> = {
  async register(_, { email, password }: GQL.IRegisterOnMutationArguments) {
    if (await Seller.findOne({ where: { email } })) {
      throw new AuthenticationError(AuthErrors.duplicateUser);
    }

    const passwordHash = await hash(password, 12);

    const seller = Seller.create({ email, passwordHash });
    await validate(seller);
    await Seller.save(seller);

    const link = `${join(process.env.URL!, '/confirm')}?${stringify({
      email,
    })}`;
    await send({
      email,
      subject: 'Click to confirm email',
      html: `Please click the link to confirm your email. <br /><br /> ${link}`,
    });

    return true;
  },

  async login(
    _,
    { email, password, type }: GQL.ILoginOnMutationArguments,
    { req },
  ) {
    let Ent: typeof Admin | typeof Seller;
    if (type === 'SELLER') {
      Ent = Seller;
    } else if (type === 'ADMIN') {
      Ent = Admin;
    } else {
      throw new AuthenticationError('Invalid Type');
    }

    const user = await Ent.findOne({ where: { email } });

    if (!user) {
      throw new AuthenticationError(AuthErrors.wrongCredentials);
    }

    if (user instanceof Seller && !user.confirmedAt) {
      throw new AuthenticationError(AuthErrors.notConfimed);
    }

    if (!(await compare(password, user.passwordHash))) {
      throw new AuthenticationError(AuthErrors.wrongCredentials);
    }

    if (req.session) {
      req.session.userId = user.id;
      req.session.userType = type;
    }

    return true;
  },
  async logout(_, args, { req, res }) {
    await logout(req, res);
    return true;
  },
};

import { compare, hash } from 'bcryptjs';
import { Admin } from '../admin/admin.entity';
import { Seller } from '../seller/seller.entity';
import { validate } from '../util';
import { IResolver } from '../util/types';
import { Request, Response } from 'express';
import { AuthenticationError } from '../util/auth';

export async function logout(req: Request, res: Response) {
  if (req.session) {
    await new Promise(done => req.session!.destroy(done));
  }
  res.clearCookie('session');
}

export const MutationResolver: IResolver<GQL.IMutation> = {
  async register(_, { email, password }: GQL.IRegisterOnMutationArguments) {
    const passwordHash = await hash(password, 12);

    const seller = Seller.create({ email, passwordHash });
    await validate(seller);
    await Seller.save(seller);

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
      throw new AuthenticationError();
    }

    const user = await Ent.findOne({ email });

    if (!user) {
      throw new AuthenticationError('Wrong email or password');
    }

    if (!(await compare(password, user.passwordHash))) {
      throw new AuthenticationError('Wrong email or password');
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

import { compare, hash } from 'bcryptjs';
import { Admin } from '../admin/admin.entity';
import { Seller } from '../seller/seller.entity';
import { validate } from '../util';
import { AuthenticationError } from '../util/auth';
import { IResolver } from '../util/types';

export const MutationResolver: IResolver<GQL.IMutation> = {
  async register(_, { email, password }: GQL.IRegisterOnMutationArguments) {
    if (await Seller.findOne({ where: { email } })) {
      throw new AuthenticationError('DUPLICATE_USER');
    }

    const passwordHash = await hash(password, 12);

    const seller = Seller.create({ email, passwordHash });
    await validate(seller);
    await Seller.save(seller);

    await sendConfirmationEmail(origin, seller.id, seller.email);

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
      throw new AuthenticationError('WRONG_CREDENTIALS');
    }

    if (user instanceof Seller && !user.confirmedAt) {
      throw new AuthenticationError('NOT_CONFIRMED');
    }

    if (!(await compare(password, user.passwordHash))) {
      throw new AuthenticationError('WRONG_CREDENTIALS');
    }

    if (req.session) {
      req.session.userId = user.id;
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
  async confirm(_, { id: binId }: GQL.IConfirmOnMutationArguments) {
    const id = atob(binId);
    const seller = await Seller.findOne({ where: { id } });

    if (!seller) {
      throw new AuthenticationError('WRONG_CREDENTIALS');
    }

    seller.confirmedAt = new Date();
    await Seller.save(seller);

    return true;
  },
};

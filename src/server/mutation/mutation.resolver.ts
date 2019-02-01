import { hash } from 'bcryptjs';
import { Seller } from '../seller/seller.entity';
import { validate } from '../util';
import { sign } from '../util/jwt';
import { IResolver } from '../util/types';

export const MutationResolver: IResolver<GQL.IMutation> = {
  async register(_, { email, password }: GQL.IRegisterOnMutationArguments) {
    const passwordHash = await hash(password, 12);
    const seller = Seller.create({ email, passwordHash });
    await validate(seller);
    const { id } = await Seller.save(seller);
    const token = await sign({ email, id, type: GQL.UserType.SELLER });
    return token;
  },
};

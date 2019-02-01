import { Request } from 'express';
import { IResolver } from '../util/types';
import { Seller } from '../seller/seller.entity';
import { hash } from 'bcryptjs';
import { validate } from '../util';
import { sign } from '../util/jwt';

export const MutationResolver: IResolver<GQL.IMutation, Request> = {
  async register(req, { email, password }: GQL.IRegisterOnMutationArguments) {
    const passwordHash = await hash(password, 12);
    const seller = Seller.create({ email, passwordHash });
    await validate(seller);
    // const { id } = await Seller.save(seller);
    const token = await sign({ email, id: '20' });
    return token;
  },
};

import * as jwt from 'jsonwebtoken';
import { Admin } from '../admin/admin.entity';
import { Seller } from '../seller/seller.entity';

const secret = process.env.SECRET!;

type Payload = { email: string; id: string; type: GQL.UserType };

const verifyOptions: jwt.VerifyOptions = {
  maxAge: '24hr',
  algorithms: ['HS256'],
};
export const verify = (token: string) =>
  new Promise<Payload>((resolve, reject) => {
    return jwt.verify(token, secret, verifyOptions, (err, payload) => {
      if (err) {
        return reject(err);
      }
      resolve(payload as Payload);
    });
  });

const signOptions: jwt.SignOptions = { expiresIn: '24hr', algorithm: 'HS256' };
export const sign = (payload: Payload) =>
  new Promise<string>((resolve, reject) => {
    jwt.sign(payload, secret, signOptions, (err, token) => {
      if (err) {
        return reject(err);
      }
      resolve(token);
    });
  });

export const getUser = async (
  token: string,
): Promise<Seller | Admin | undefined> => {
  let payload;
  try {
    payload = await verify(token);
  } catch {
    return undefined;
  }
  if (typeof payload === 'string') {
    throw new Error('jwt: Payload is a string');
  }

  if (payload.type === 'SELLER') {
    return Seller.findOne(payload.id);
  }
  if (payload.type === 'ADMIN') {
    return Admin.findOne(payload.id);
  }
};

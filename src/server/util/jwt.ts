import * as jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { Admin } from '../admin/admin.entity';
import { Seller } from '../seller/seller.entity';

const secret = process.env.SECRET!;

type Payload = string | { [key: string]: string };

const verifyOptions: jwt.VerifyOptions = {};
export const verify = (token: string) =>
  new Promise<Payload>((resolve, reject) => {
    return jwt.verify(token, secret, verifyOptions, (err, payload) => {
      if (err) {
        return reject(err);
      }
      resolve(payload as any);
    });
  });

const signOptions: jwt.SignOptions = {};
export const sign = (payload: Payload) =>
  new Promise<string>((resolve, reject) => {
    jwt.sign(payload, secret, signOptions, (err, token) => {
      if (err) {
        return reject(err);
      }
      resolve(token);
    });
  });

export const getUser = async (token: string): Promise<Seller | Admin> => {
  const payload = await verify(token);

  if (typeof payload === 'string') {
    throw new Error('jwt: Payload is a string');
  }

  if (payload.type === 'seller') {
    const sellerRepo = getRepository(Seller);
    return sellerRepo.findOneOrFail(payload.id);
  }
  if (payload.type === 'admin') {
    const adminRepo = getRepository(Admin);
    return adminRepo.findOneOrFail(payload.id);
  }
  throw new Error('Invalid token');
};

import {
  ApolloError,
  AuthenticationError as AuthError,
} from 'apollo-server-express';
import { Admin } from '../admin/admin.entity';
import { Seller } from '../seller/seller.entity';

export class AuthorizationError extends ApolloError {
  constructor(msg?: string) {
    super(msg || 'Unauthorized', 'UNAUTHORIZED');
  }
}

export class AuthenticationError extends AuthError {
  constructor(msg?: string) {
    super(msg || 'Unauthenticated');
  }
}

export function checkUser(Type: typeof Seller | typeof Admin, user?: any) {
  if (!user) {
    throw new AuthenticationError();
  }
  if (!(user instanceof Type)) {
    throw new AuthorizationError();
  }
}

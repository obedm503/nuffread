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

export function isSeller(user?: Admin | Seller): user is Seller {
  if (!user) {
    throw new AuthenticationError();
  }
  if (!(user instanceof Seller)) {
    throw new AuthorizationError();
  }

  return user instanceof Seller;
}

export function isAdmin(user?: Admin | Seller): user is Admin {
  if (!user) {
    throw new AuthenticationError();
  }
  if (!(user instanceof Admin)) {
    throw new AuthorizationError();
  }

  return user instanceof Admin;
}

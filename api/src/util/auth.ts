import {
  ApolloError,
  AuthenticationError as AuthError,
} from 'apollo-server-express';
import { Admin } from '../admin/admin.entity';
import { User } from '../user/user.entity';

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

export function isUser(user?: Admin | User): user is User {
  if (!user) {
    throw new AuthenticationError();
  }
  if (!(user instanceof User)) {
    throw new AuthorizationError();
  }

  return user instanceof User;
}

export function isAdmin(user?: Admin | User): user is Admin {
  if (!user) {
    throw new AuthenticationError();
  }
  if (!(user instanceof Admin)) {
    throw new AuthorizationError();
  }

  return user instanceof Admin;
}

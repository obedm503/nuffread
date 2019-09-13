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

export function isUser(me?: Admin | User): me is User {
  if (!me) {
    throw new AuthenticationError();
  }
  if (!(me instanceof User)) {
    throw new AuthorizationError();
  }

  return me instanceof User;
}

export function isAdmin(me?: Admin | User): me is Admin {
  if (!me) {
    throw new AuthenticationError();
  }
  if (!(me instanceof Admin)) {
    throw new AuthorizationError();
  }

  return me instanceof Admin;
}
export function isPublic(me?: Admin | User): me is undefined {
  if (me) {
    throw new AuthenticationError();
  }
  return !me;
}

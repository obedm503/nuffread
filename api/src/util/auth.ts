import { Admin, User } from '../entities';
import { AuthenticationError, AuthorizationError } from './error';

export function isUser(me?: User): me is User {
  return me instanceof User && !!me.confirmedAt;
}

export function ensureUser(me?: Admin | User): me is User {
  if (!me) {
    throw new AuthenticationError();
  }
  if (!(me instanceof User)) {
    throw new AuthorizationError();
  }

  return me instanceof User;
}

export function ensureAdmin(me?: Admin | User): me is Admin {
  if (!me) {
    throw new AuthenticationError();
  }
  if (!(me instanceof Admin)) {
    throw new AuthorizationError();
  }

  return me instanceof Admin;
}
export function ensurePublic(me?: Admin | User): me is undefined {
  if (me) {
    throw new AuthenticationError();
  }
  return !me;
}

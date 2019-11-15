import { User } from '../entities';
import { SystemUserType } from '../schema.gql';
import { AuthenticationError, AuthorizationError } from './error';
import { UserSession } from './types';

export function isUser(me?: User): me is User {
  return me instanceof User && !!me.confirmedAt;
}

export function ensureUser(me?: UserSession): void {
  if (
    me &&
    'userType' in me &&
    typeof me.userType === 'string' &&
    me.userType === SystemUserType.User
  ) {
    return;
  }

  throw new AuthorizationError();
}

export function ensureAdmin(me?: UserSession): void {
  if (
    me &&
    'userType' in me &&
    typeof me.userType === 'string' &&
    me.userType === SystemUserType.Admin
  ) {
    return;
  }

  throw new AuthorizationError();
}

export function ensurePublic(me?: UserSession): void {
  if (me) {
    throw new AuthenticationError();
  }
}

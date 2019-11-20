import { User } from '../entities';
import { SystemUserType } from '../schema.gql';
import { AuthenticationError, AuthorizationError } from './error';
import { UserSession } from './types';

export function isUser(me?: User): me is User {
  return me instanceof User && !!me.confirmedAt;
}

export function ensureUser(session?: UserSession): void {
  if (
    session &&
    'userType' in session &&
    typeof session.userType === 'string' &&
    session.userType === SystemUserType.User
  ) {
    return;
  }

  throw new AuthorizationError();
}

export function ensureAdmin(session?: UserSession): void {
  if (
    session &&
    'userType' in session &&
    typeof session.userType === 'string' &&
    session.userType === SystemUserType.Admin
  ) {
    return;
  }

  throw new AuthorizationError();
}

export function ensurePublic(session?: UserSession): void {
  if (!session) {
    return;
  }
  if (!('userId' in session)) {
    return;
  }
  if (!('userType' in session)) {
    return;
  }
  throw new AuthenticationError();
}

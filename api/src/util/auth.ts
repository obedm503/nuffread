import { User } from '../entities';
import { SystemUserType } from '../schema.gql';
import { AuthenticationError, AuthorizationError } from './error';
import { AdminSession, PublicSession, Session, UserSession } from './types';

export function isUser(me?: User): me is User {
  return me instanceof User && !!me.confirmedAt;
}

export function userSession(session?: Session): session is UserSession {
  return (
    !!session &&
    'userType' in session &&
    typeof session.userType === 'string' &&
    session.userType === SystemUserType.User
  );
}
export function ensureUser(session?: Session): asserts session is UserSession {
  if (userSession(session)) {
    return;
  }

  throw new AuthorizationError();
}

export function adminSession(session?: Session): session is AdminSession {
  return (
    !!session &&
    'userType' in session &&
    typeof session.userType === 'string' &&
    session.userType === SystemUserType.Admin
  );
}
export function ensureAdmin(
  session?: Session,
): asserts session is AdminSession {
  if (adminSession(session)) {
    return;
  }

  throw new AuthorizationError();
}

export function ensurePublic(
  session?: Session,
): asserts session is PublicSession {
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

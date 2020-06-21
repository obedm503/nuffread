import { User } from '../db/entities';
import { AdminSession, PublicSession, Session, UserSession } from '../types';
import { AuthenticationError, AuthorizationError } from './error';
import { SystemUserType } from './schema.gql';

export function isUser(me?: User): me is User {
  return me instanceof User && !!me.confirmedAt;
}

function ensureAuthenticated(
  session?: Session,
): asserts session is UserSession | AdminSession {
  if (
    !session ||
    typeof session.userId !== 'string' ||
    typeof session.userType !== 'string'
  ) {
    throw new AuthenticationError();
  }
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
  ensureAuthenticated(session);

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
  ensureAuthenticated(session);

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

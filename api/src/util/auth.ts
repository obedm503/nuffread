import { Admin } from '../admin/admin.entity';
import { User } from '../user/user.entity';
import { AuthenticationError, AuthorizationError } from './error';

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

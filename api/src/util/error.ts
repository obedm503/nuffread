import { ApolloError } from 'apollo-server-core';
import { logger } from '.';
import { UserSession } from './types';

Object.defineProperty(Error.prototype, 'toJSON', {
  configurable: true,
  writable: true,
  value() {
    const obj = {};
    const ownProps = Object.getOwnPropertyNames(this);
    // always include name, message, and stack
    ownProps.concat('name', 'message', 'stack').forEach(key => {
      obj[key] = this[key];
    });

    return obj;
  },
});

export class AuthorizationError extends ApolloError {
  constructor() {
    super('UNAUTHORIZED');
  }
}

export class AuthenticationError extends ApolloError {
  constructor() {
    super('UNAUTHENTICATED');
  }
}

export class BadRequest extends ApolloError {
  constructor() {
    super('BAD_REQUEST');
  }
}

export class BookNotFound extends ApolloError {
  constructor() {
    super('BOOK_NOT_FOUND');
  }
}

export class ListingNotFound extends ApolloError {
  constructor({ id, session }: { id: string; session: UserSession }) {
    super('LISTING_NOT_FOUND');
    logger.error({ id, userId: session.userId }, 'LISTING_NOT_FOUND');
  }
}

export class ThreadNotFound extends ApolloError {
  constructor({ id, session }: { id: string; session: UserSession }) {
    super('THREAD_NOT_FOUND');
    logger.error({ id, userId: session.userId }, 'THREAD_NOT_FOUND');
  }
}
export class UserNotFound extends ApolloError {
  constructor({ id, session }: { id: string; session: UserSession }) {
    super('USER_NOT_FOUND');
    logger.error({ id, userId: session.userId }, 'USER_NOT_FOUND');
  }
}

export class DuplicateUser extends ApolloError {
  constructor() {
    super('DUPLICATE_USER');
  }
}

export class WrongCredentials extends ApolloError {
  constructor() {
    super('WRONG_CREDENTIALS');
  }
}
export class NotConfirmed extends ApolloError {
  constructor() {
    super('NOT_CONFIRMED');
  }
}

export class InternalError extends ApolloError {
  constructor() {
    super('INTERNAL_SERVER_ERROR');
  }
}

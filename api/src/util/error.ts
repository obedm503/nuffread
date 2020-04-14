import { ApolloError } from 'apollo-server-core';

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
  constructor() {
    super('LISTING_NOT_FOUND');
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

import DataLoader from 'dataloader';
import { Request, Response } from 'express';
import {
  Admin,
  Book,
  Listing,
  Message,
  SavedListing,
  School,
  Thread,
  User,
} from './db/entities';
import { SystemUserType } from './graphql';

export type UserSession = Express.Session & {
  userId: string;
  userType: SystemUserType.User;
};
export type AdminSession = Express.Session & {
  userId: string;
  userType: SystemUserType.Admin;
};
export type PublicSession =
  | undefined
  | (Express.Session & {
      userId: undefined;
      userType: undefined;
    });
export type Session = UserSession | AdminSession | PublicSession;

export type GetMe = () => Promise<User | Admin | undefined>;
export type IContext = {
  req?: Request;
  res?: Response;
  session?: Session;
  getMe: GetMe;
  adminLoader(): DataLoader<string, Admin | undefined>;
  bookLoader(): DataLoader<string, Book | undefined>;
  listingLoader(): DataLoader<string, Listing | undefined>;
  savedListingLoader(): DataLoader<string, SavedListing | undefined>;
  schoolLoader(): DataLoader<string, School | undefined>;
  threadLoader(): DataLoader<string, Thread | undefined>;
  userEmailLoader(): DataLoader<string, User | undefined>;
  userLoader(): DataLoader<string, User | undefined>;
};

type Paginated<T> = { items: T[]; totalCount: number };
export type PaginatedListings = Paginated<Listing>;
export type PaginatedBooks = Paginated<Book>;
export type PaginatedThreads = Paginated<Thread>;
export type PaginatedMessages = Paginated<Message>;

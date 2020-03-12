import DataLoader from 'dataloader';
import { Request, Response } from 'express';
import {
  Admin,
  Book,
  Invite,
  Listing,
  SavedListing,
  School,
  User,
} from '../entities';
import { SystemUserType } from '../schema.gql';

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

export type IContext = {
  req: Request;
  res: Response;
  session?: UserSession;
  getMe: () => Promise<User | Admin | undefined>;
  userLoader: DataLoader<string, User | undefined>;
  userEmailLoader: DataLoader<string, User | undefined>;
  adminLoader: DataLoader<string, Admin | undefined>;
  listingLoader: DataLoader<string, Listing | undefined>;
  bookLoader: DataLoader<string, Book | undefined>;
  inviteLoader: DataLoader<string, Invite | undefined>;
  schoolLoader: DataLoader<string, School | undefined>;
  savedListingLoader: DataLoader<string, SavedListing | undefined>;
};

export type PaginatedListings = { items: Listing[]; totalCount: number };

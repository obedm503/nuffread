import DataLoader from 'dataloader';
import { Request, Response } from 'express';
import { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';
import { IEnumResolver, IResolverOptions, MergeInfo } from 'graphql-tools';
import Stripe from 'stripe';
import { Admin, Book, Invite, Listing, User } from '../entities';

export type IContext = {
  req: Request;
  res: Response;
  me?: User | Admin;
  stripe: Stripe;
  userLoader: DataLoader<string, User | undefined>;
  adminLoader: DataLoader<string, Admin | undefined>;
  listingLoader: DataLoader<string, Listing | undefined>;
  bookLoader: DataLoader<string, Book | undefined>;
  inviteLoader: DataLoader<string, Invite | undefined>;
};

// these types are based on graphql-tools types

// from https://stackoverflow.com/questions/54713272/how-can-i-make-a-partialt-but-only-for-nullable-fields
type NullableKeys<T> = {
  [K in keyof T]: undefined extends T[K] ? K : never;
}[keyof T];
// type NullablePartial<T> = Partial<T> & Omit<T, NullableKeys<T>>;

// use "any" until recursive types land https://github.com/Microsoft/TypeScript/issues/6230
// only checks 2 levels deep and stops
type IfObject<T, ST> = T extends object ? ST : T;

// level 2
type SubObject<T> = T extends any[] ? any[] : IfObject<T, any>;
// level 1
type FixObject<T> = T extends Array<infer ST>
  ? SubObject<ST>[]
  : T extends object
  ? { [K in keyof T]?: IfObject<T[K], SubObject<T[K]>> } &
      {
        [K in Exclude<keyof T, NullableKeys<T>>]: IfObject<
          T[K],
          SubObject<T[K]>
        >;
      }
  : T;
type FixPartials<T> = T extends Array<infer ST>
  ? FixObject<ST>[]
  : FixObject<T>;

type IFieldResolver<TRoot, TReturn> = (
  root: TRoot,
  args: any,
  context: IContext,
  info: GraphQLResolveInfo & {
    mergeInfo: MergeInfo;
  },
) => FixPartials<TReturn> | Promise<FixPartials<TReturn>>;

type BaseResolver<T> = T & {
  __resolveType?: string;
};

export type IResolver<TQuery = any, TRoot = never> = {
  [key in keyof BaseResolver<TQuery>]?:
    | IFieldResolver<TRoot, BaseResolver<TQuery>[key]>
    | IResolverOptions<TRoot, IContext>
    | IResolver<TQuery, TRoot>;
};

export interface IResolvers {
  [key: string]:
    | (() => any)
    | IResolver
    | IResolverOptions
    | GraphQLScalarType
    | IEnumResolver;
}

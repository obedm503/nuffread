import DataLoader from 'dataloader';
import { Request, Response } from 'express';
import { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';
import { IEnumResolver, IResolverOptions, MergeInfo } from 'graphql-tools';
import Stripe from 'stripe';
import { Admin } from '../admin/admin.entity';
import { Book } from '../book/book.entity';
import { Listing } from '../listing/listing.entity';
import { School } from '../school/school.entity';
import { User } from '../user/user.entity';

export type IContext = {
  req: Request;
  res: Response;
  me: User | Admin | undefined;
  stripe: Stripe;
  userLoader: DataLoader<string, User | undefined>;
  adminLoader: DataLoader<string, Admin | undefined>;
  schoolLoader: DataLoader<string, School | undefined>;
  listingLoader: DataLoader<string, Listing | undefined>;
  bookLoader: DataLoader<string, Book | undefined>;
};

// these types are based on graphql-tools types

type NoTypename<T> = T extends object ? Omit<T, '__typename'> : T;

type IFieldResolver<TSource, TReturn> = (
  source: TSource,
  args: any,
  context: IContext,
  info: GraphQLResolveInfo & {
    mergeInfo: MergeInfo;
  },
) => NoTypename<TReturn> | Promise<NoTypename<TReturn>>;

type IBaseResolver = {
  __resolveType?: string;
};

export type IResolver<TQuery = any, TRoot = never> = {
  [key in keyof (TQuery & IBaseResolver)]?:
    | IFieldResolver<TRoot, (TQuery & IBaseResolver)[key]>
    | IResolverOptions<TRoot, IContext>
    | IResolver<TQuery, TRoot>
};

export interface IResolvers {
  [key: string]:
    | (() => any)
    | IResolver
    | IResolverOptions
    | GraphQLScalarType
    | IEnumResolver;
}

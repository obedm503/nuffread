import DataLoader from 'dataloader';
import { Request } from 'express';
import { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';
import { IEnumResolver, IResolverOptions, MergeInfo } from 'graphql-tools';
import { Admin } from '../admin/admin.entity';
import { School } from '../school/school.entity';
import { Seller } from '../seller/seller.entity';

export type IContext = {
  req: Request;
  user: Seller | Admin | undefined;
  sellerLoader: DataLoader<string, Seller | null>;
  adminLoader: DataLoader<string, Admin | null>;
  schoolLoader: DataLoader<string, School | null>;
};

// these types are based on graphql-tools types

type IFieldResolver<TSource, TContext, R> = (
  source: TSource,
  args: {
    [argument: string]: any;
  },
  context: TContext,
  info: GraphQLResolveInfo & {
    mergeInfo: MergeInfo;
  },
) => R | Promise<R>;

type IBaseResolver = {
  __resolveType: string | null;
};

export type IResolver<TQuery = any, TRoot = any> = {
  [key in keyof (TQuery & IBaseResolver)]?:
    | IFieldResolver<TRoot, IContext, (TQuery & IBaseResolver)[key]>
    | IResolverOptions<TRoot, IContext>
    | IResolver<TRoot, IContext>
};

export interface IResolvers {
  [key: string]:
    | (() => any)
    | IResolver
    | IResolverOptions
    | GraphQLScalarType
    | IEnumResolver;
}

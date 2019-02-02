import DataLoader from 'dataloader';
import { Request, Response } from 'express';
import { GraphQLResolveInfo, GraphQLScalarType } from 'graphql';
import { IEnumResolver, IResolverOptions, MergeInfo } from 'graphql-tools';
import { Admin } from '../admin/admin.entity';
import { School } from '../school/school.entity';
import { Seller } from '../seller/seller.entity';

export type IContext = {
  req: Request;
  res: Response;
  user: Seller | Admin | undefined;
  sellerLoader: DataLoader<string, Seller | null>;
  adminLoader: DataLoader<string, Admin | null>;
  schoolLoader: DataLoader<string, School | null>;
};

// these types are based on graphql-tools types

type IFieldResolver<TSource, TReturn> = (
  source: TSource,
  args: any,
  context: IContext,
  info: GraphQLResolveInfo & {
    mergeInfo: MergeInfo;
  },
) => TReturn | Promise<TReturn>;

type IBaseResolver = {
  __resolveType: string | null;
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

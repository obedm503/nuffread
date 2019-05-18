import * as DataLoader from 'dataloader';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { resolve } from 'path';
import * as Stripe from 'stripe';
import { BaseEntity } from 'typeorm';
import { Admin } from './admin/admin.entity';
import { Listing } from './listing/listing.entity';
import { ListingResolver } from './listing/listing.resolver';
import { MutationResolver } from './mutation/mutation.resolver';
import { QueryResolver } from './query/query.resolver';
import { DateResolver } from './scalars/date';
import { SystemUser, SystemUserType } from './schema.gql';
import { School } from './school/school.entity';
import { Seller } from './seller/seller.entity';
import { SellerResolver } from './seller/seller.resolver';
import { IContext, IResolver, IResolvers } from './util/types';

const SystemUserResolver: IResolver<SystemUser, Admin | Seller> = {
  __resolveType(me) {
    if (me instanceof Seller) {
      return 'Seller';
    }
    if (me instanceof Admin) {
      return 'Admin';
    }
    return null;
  },
};

const makeLoader = <T extends BaseEntity>(Ent: typeof BaseEntity) => {
  return new DataLoader(async (ids: string[]) => {
    const items = await Ent.findByIds<T>(ids);
    return ids.map(id => items.find(item => (item as any).id === id) || null);
  });
};

function createSchema(): GraphQLSchema {
  const typeDefs = fs.readFileSync(
    resolve(__dirname, '../schema.gql'),
    'utf-8',
  );
  const resolvers: IResolvers = {
    Date: DateResolver,
    SystemUser: SystemUserResolver,
    Query: QueryResolver,
    Listing: ListingResolver,
    Mutation: MutationResolver,
    Seller: SellerResolver,
  };
  return makeExecutableSchema<IContext>({
    typeDefs,
    resolvers,
  });
}

async function getUser(
  id: string,
  type: SystemUserType,
): Promise<Seller | Admin | undefined> {
  if (type === 'SELLER') {
    return Seller.findOne(id);
  }
  if (type === 'ADMIN') {
    return Admin.findOne(id);
  }
}

let schema: GraphQLSchema;
export const getSchema = () => {
  if (!schema) {
    schema = createSchema();
  }
  return schema;
};

let stripe;
const getStripe = (): Stripe => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_API_KEY!);
  }
  return stripe;
};

export async function getContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<IContext> {
  const me = req.session
    ? await getUser(req.session.userId, req.session.userType)
    : undefined;
  return {
    me,
    req,
    res,
    stripe: getStripe(),
    sellerLoader: makeLoader(Seller),
    adminLoader: makeLoader(Admin),
    schoolLoader: makeLoader(School),
    listingLoader: makeLoader(Listing),
  };
}

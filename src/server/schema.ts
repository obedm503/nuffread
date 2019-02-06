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
import { School } from './school/school.entity';
import { Seller } from './seller/seller.entity';
import { SellerResolver } from './seller/seller.resolver';
import { IContext, IResolver, IResolvers } from './util/types';

const UserResolver: IResolver<GQL.User, Admin | Seller> = {
  __resolveType(user) {
    if (user instanceof Seller) {
      return 'Seller';
    }
    if (user instanceof Admin) {
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
    resolve(__dirname, '../../src/types.gql'),
    'utf-8',
  );
  const resolvers: IResolvers = {
    Date: DateResolver,
    User: UserResolver,
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
  type: GQL.UserType,
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
  const user = req.session
    ? await getUser(req.session.userId, req.session.userType)
    : undefined;
  return {
    user,
    req,
    res,
    stripe: getStripe(),
    sellerLoader: makeLoader(Seller),
    adminLoader: makeLoader(Admin),
    schoolLoader: makeLoader(School),
    listingLoader: makeLoader(Listing),
  };
}

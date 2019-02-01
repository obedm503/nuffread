import * as DataLoader from 'dataloader';
import { Request } from 'express';
import * as fs from 'fs';
import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { resolve } from 'path';
import { BaseEntity } from 'typeorm';
import { Admin } from './admin/admin.entity';
import { ListingResolver } from './listing/listing.resolver';
import { MutationResolver } from './mutation/mutation.resolver';
import { QueryResolver } from './query/query.resolver';
import { DateResolver } from './scalars/date';
import { School } from './school/school.entity';
import { Seller } from './seller/seller.entity';
import { getUser } from './util/jwt';
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
  };
  return makeExecutableSchema<IContext>({
    typeDefs,
    resolvers,
  });
}

let schema: GraphQLSchema;
export const getSchema = () => {
  if (!schema) {
    schema = createSchema();
  }
  return schema;
};
export async function getContext(req: Request): Promise<IContext> {
  const token = req.header('authorization');
  const user = token ? await getUser(token) : undefined;
  return {
    user,
    req,
    sellerLoader: makeLoader(Seller),
    adminLoader: makeLoader(Admin),
    schoolLoader: makeLoader(School),
  };
}

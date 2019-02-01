import { GraphQLServerOptions } from 'apollo-server-core/dist/graphqlOptions';
import * as DataLoader from 'dataloader';
import { Request } from 'express';
import * as fs from 'fs';
import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { resolve } from 'path';
import { BaseEntity } from 'typeorm';
import { Admin } from './admin/admin.entity';
import { ListingResolver } from './listing/listing.resolver';
import { QueryResolver } from './query/query.resolver';
import { DateResolver } from './scalars/date';
import { School } from './school/school.entity';
import { Seller } from './seller/seller.entity';
import { IContext, IResolver, IResolvers } from './util/types';
import { getUser } from './util/jwt';

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
  };
  return makeExecutableSchema<IContext>({
    typeDefs,
    resolvers,
  });
}

let schema: GraphQLSchema;
export async function getApolloConfig(
  req: Request,
): Promise<GraphQLServerOptions<IContext>> {
  if (!schema) {
    schema = createSchema();
  }

  const auth = req.header('authorization');
  const user = auth ? await getUser(auth) : undefined;
  const context: IContext = {
    user,
    req,
    sellerLoader: makeLoader(Seller),
    adminLoader: makeLoader(Admin),
    schoolLoader: makeLoader(School),
  };
  return {
    schema,
    rootValue: req,
    context,
  };
}

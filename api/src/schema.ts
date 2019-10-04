import * as DataLoader from 'dataloader';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { resolve } from 'path';
import * as Stripe from 'stripe';
import { Admin } from './admin/admin.entity';
import { Book } from './book/book.entity';
import { Invite } from './invite/invite.entity';
import { InviteResolver } from './invite/invite.resolver';
import { Listing } from './listing/listing.entity';
import { ListingResolver } from './listing/listing.resolver';
import { MutationResolver } from './mutation/mutation.resolver';
import { QueryResolver } from './query/query.resolver';
import { DateResolver } from './scalars/date';
import { SystemUser, SystemUserType } from './schema.gql';
import { School } from './school/school.entity';
import { User } from './user/user.entity';
import { UserResolver } from './user/user.resolver';
import { logger } from './util';
import { Base } from './util/db';
import { IContext, IResolver, IResolvers } from './util/types';

const SystemUserResolver: IResolver<SystemUser, Admin | User> = {
  __resolveType(me) {
    if (me instanceof User) {
      return 'User';
    }
    if (me instanceof Admin) {
      return 'Admin';
    }
  },
};

const makeLoader = <T extends Base>(Ent: typeof Base) => {
  return new DataLoader(async (ids: string[]) => {
    logger.debug(Ent.name, ids);
    const items = await Ent.findByIds<T>(ids);
    return ids.map(id => items.find(item => item['id'] === id));
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
    User: UserResolver,
    Invite: InviteResolver,
  };
  return makeExecutableSchema<IContext>({
    typeDefs,
    resolvers,
  });
}

async function getUser(
  id: string,
  type: SystemUserType,
): Promise<User | Admin | undefined> {
  if (type === 'USER') {
    return User.findOne(id);
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
    userLoader: makeLoader(User),
    adminLoader: makeLoader(Admin),
    schoolLoader: makeLoader(School),
    listingLoader: makeLoader(Listing),
    bookLoader: makeLoader(Book),
    inviteLoader: makeLoader(Invite),
  };
}

export const getEntities = () => [User, Admin, School, Listing, Book, Invite];

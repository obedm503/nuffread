import * as DataLoader from 'dataloader';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { resolve } from 'path';
import * as Stripe from 'stripe';
import { Admin, Book, Invite, Listing, School, User } from './entities';
import { RecentListing } from './entities/recent-listing.entity';
import { SavedListing } from './entities/saved-listing.entity';
import {
  BookResolver,
  DateResolver,
  InviteResolver,
  ListingResolver,
  MutationResolver,
  QueryResolver,
  SchoolResolver,
  SystemUserResolver,
  UserResolver,
} from './resolvers';
import { SystemUserType } from './schema.gql';
import { logger } from './util';
import { Base } from './util/db';
import { IContext, IResolvers, UserSession } from './util/types';

function makeIdLoader<T extends Base & { id: string }>(Ent: typeof Base) {
  return new DataLoader(async (ids: readonly string[]) => {
    logger.debug(Ent.name, ids);
    const items = await Ent.findByIds<T>(ids as any);
    return ids.map(id => items.find(item => item.id === id));
  });
}
function makeEmailLoader<T extends Base & { email: string }>(Ent: typeof Base) {
  return new DataLoader(async (emails: readonly string[]) => {
    logger.debug(Ent.name, emails);
    const items = await Ent.find<T>({
      where: emails.map(email => ({ email })),
    });
    return emails.map(email => items.find(item => item.email === email));
  });
}

function createSchema(): GraphQLSchema {
  const typeDefs = fs.readFileSync(
    resolve(__dirname, '../../schema.gql'),
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
    Book: BookResolver,
    School: SchoolResolver,
  };
  return makeExecutableSchema<IContext>({
    typeDefs,
    resolvers,
  });
}

async function getMe(session?: UserSession): Promise<User | Admin | undefined> {
  if (!session) {
    return;
  }

  const id = session.userId;
  const type = session.userType;
  if (type === SystemUserType.User) {
    return User.findOne(id);
  }
  if (type === SystemUserType.Admin) {
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
  const session = req.session as UserSession | undefined;
  let me;
  return {
    getMe: async () => {
      if (!me) {
        me = await getMe(session);
      }
      return me;
    },
    req,
    res,
    session,
    stripe: getStripe(),
    userLoader: makeIdLoader(User),
    adminLoader: makeIdLoader(Admin),
    listingLoader: makeIdLoader(Listing),
    bookLoader: makeIdLoader(Book),
    inviteLoader: makeEmailLoader(Invite),
    userEmailLoader: makeEmailLoader(User),
    schoolLoader: makeIdLoader(School),
  };
}

export const getEntities = () => [
  User,
  Admin,
  Listing,
  Book,
  Invite,
  RecentListing,
  SavedListing,
  School,
];

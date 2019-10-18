import * as DataLoader from 'dataloader';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { GraphQLSchema } from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { resolve } from 'path';
import * as Stripe from 'stripe';
import { Admin, Book, Invite, Listing, User } from './entities';
import {
  DateResolver,
  InviteResolver,
  ListingResolver,
  MutationResolver,
  QueryResolver,
  SystemUserResolver,
  UserResolver,
} from './resolvers';
import { SystemUserType } from './schema.gql';
import { logger } from './util';
import { Base } from './util/db';
import { IContext, IResolvers } from './util/types';

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
    listingLoader: makeLoader(Listing),
    bookLoader: makeLoader(Book),
    inviteLoader: new DataLoader(async (emails: string[]) => {
      logger.debug('Invite', emails);
      const invites = await Invite.find({
        where: emails.map(email => ({ email })),
      });
      return emails.map(email =>
        invites.find(invite => invite.email === email),
      );
    }),
  };
}

export const getEntities = () => [User, Admin, Listing, Book, Invite];

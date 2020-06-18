import { makeExecutableSchema } from '@graphql-tools/schema';
import DataLoader from 'dataloader';
import { Request, Response } from 'express';
import * as fs from 'fs';
import { GraphQLSchema } from 'graphql';
import { resolve } from 'path';
import {
  Admin,
  Book,
  Listing,
  SavedListing,
  School,
  Thread,
  User,
} from './entities';
import {
  BookResolver,
  DateResolver,
  ListingResolver,
  MessageResolver,
  MutationResolver,
  QueryResolver,
  SchoolResolver,
  SubscriptionResolver,
  SystemUserResolver,
  ThreadResolver,
  UserResolver,
} from './resolvers';
import { SystemUserType } from './schema.gql';
import { lazy, logger } from './util';
import { Base } from './util/db';
import { IContext, Session } from './util/types';

function makeIdLoader<T extends Base & { id: string }>(Ent: typeof Base) {
  return new DataLoader(async (ids: readonly string[]) => {
    logger.debug(`data-loader ${Ent.name}`, ids);
    const items = await Ent.findByIds<T>(ids as any);
    return ids.map(id => items.find(item => item.id === id));
  });
}
function makeEmailLoader<T extends Base & { email: string }>(Ent: typeof Base) {
  return new DataLoader(async (emails: readonly string[]) => {
    logger.debug(`data-loader ${Ent.name}`, emails);
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

  return makeExecutableSchema<IContext>({
    typeDefs,
    resolvers: {
      Book: BookResolver,
      Date: DateResolver,
      Listing: ListingResolver,
      Message: MessageResolver,
      Mutation: MutationResolver,
      Query: QueryResolver,
      School: SchoolResolver,
      Subscription: SubscriptionResolver,
      SystemUser: SystemUserResolver,
      Thread: ThreadResolver,
      User: UserResolver,
    },
  });
}

async function getMe(session?: Session): Promise<User | Admin | undefined> {
  if (!session) {
    return;
  }

  const id = session.userId;
  const type = session.userType;
  if (!id || !type) {
    return;
  }
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

export async function getContext({
  session,
  req,
  res,
}: {
  session?: Session;
  req?: Request;
  res?: Response;
}): Promise<IContext> {
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
    adminLoader: lazy(() => makeIdLoader(Admin)),
    bookLoader: lazy(() => makeIdLoader(Book)),
    listingLoader: lazy(() => makeIdLoader(Listing)),
    savedListingLoader: lazy(() => {
      return new DataLoader(async (ids: readonly string[]) => {
        // in format listingId::userId
        logger.debug(`data-loader ${SavedListing.name}`, ids);

        const items = await SavedListing.find({
          where: ids.map(id => {
            const [listingId, userId] = id.split('::');
            return { listingId, userId };
          }),
        });

        return ids.map(id => {
          const [listingId, userId] = id.split('::');

          return items.find(
            item => item.listingId === listingId && item.userId === userId,
          );
        });
      });
    }),
    schoolLoader: lazy(() => makeIdLoader(School)),
    threadLoader: lazy(() => makeIdLoader(Thread)),
    userEmailLoader: lazy(() => makeEmailLoader(User)),
    userLoader: lazy(() => makeIdLoader(User)),
  };
}

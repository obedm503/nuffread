import { makeExecutableSchema } from '@graphql-tools/schema';
import * as fs from 'fs';
import { GraphQLSchema } from 'graphql';
import { resolve } from 'path';
import { IContext } from '../types';
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

export const schema: GraphQLSchema = (function () {
  const typeDefs = fs.readFileSync(
    resolve(__dirname, '../../../schema.gql'),
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
})();

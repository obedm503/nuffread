import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { getApolloConfig } from './schema';
import { DBModule } from './util/db';

const production = process.env.NODE_ENV === 'production';

@Module({
  imports: [GraphQLModule, DBModule],
  controllers: [
    // AuthController,
    AppController,
  ],
})
export class ApplicationModule implements NestModule {
  constructor(private readonly connection: Connection) {}

  configure(consumer: MiddlewareConsumer) {
    if (process.env.DB_SYNC === 'true') {
      this.connection.synchronize();
    }

    // graphql
    consumer
      .apply(graphqlExpress(req => getApolloConfig(req!)))
      .forRoutes({ path: '/graphql', method: RequestMethod.ALL });

    if (!production) {
      consumer
        // graphiql
        .apply(graphiqlExpress({ endpointURL: '/graphql' }))
        .forRoutes({ path: '/graphiql', method: RequestMethod.GET });
    }
  }
}

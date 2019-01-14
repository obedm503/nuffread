import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { graphiqlExpress, graphqlExpress } from 'apollo-server-express';
import { Connection } from 'typeorm';
import { AdminResolver } from './admin/admin.resolver';
import { AdminService } from './admin/admin.service';
import { AppController } from './app.controller';
import { Schema, UserResolver } from './schema';
import { SchoolResolver } from './school/school.resolver';
import { SchoolService } from './school/school.service';
import { SellerResolver } from './seller/seller.resolver';
import { SellerService } from './seller/seller.service';
import { DBModule } from './util/db';

const production = process.env.NODE_ENV === 'production';

@Module({
  imports: [GraphQLModule, DBModule],
  providers: [
    Schema,
    // AuthService,
    // JwtStrategy,
    // GoogleStrategy,

    // TextQuestionResolver,
    // NumberQuestionResolver,
    // QuestionResolver,

    SellerService,
    SellerResolver,

    SchoolService,
    SchoolResolver,

    AdminService,
    AdminResolver,

    UserResolver,
  ],
  controllers: [
    // AuthController,
    AppController,
  ],
})
export class ApplicationModule implements NestModule {
  constructor(
    private readonly schema: Schema,
    private readonly connection: Connection,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    if (process.env.DB_SYNC === 'true') {
      this.connection.synchronize();
    }

    // consumer
    //   // login with google
    //   .apply(googleAuth({ isCallback: false }))
    //   .forRoutes({ path: '/auth/google', method: RequestMethod.GET })

    //   .apply(googleAuth({ isCallback: true }))
    //   .forRoutes({ path: '/auth/google/callback', method: RequestMethod.GET });

    // authenticate with jwt
    // consumer
    //   .apply(
    //     (
    //       req: express.Request,
    //       res: express.Response,
    //       next: express.NextFunction,
    //     ) => {
    //       passport.authenticate(
    //         'jwt',
    //         { session: false },
    //         (err, user, info) => {
    //           if (err) {
    //             console.debug('authenticate jwt', err, info);
    //             return next(err);
    //           }
    //           if (!user) {
    //             console.debug('authenticate jwt: no user', info);
    //             return next(new UnauthorizedException());
    //           }
    //           req.user = user;
    //           next();
    //         },
    //       )(req, res, next);
    //     },
    //   )
    //   .forRoutes({ path: '/graphql', method: RequestMethod.ALL });

    // graphql
    consumer
      .apply(graphqlExpress(req => this.schema.getConfig(req!)))
      .forRoutes({ path: '/graphql', method: RequestMethod.ALL });

    if (!production) {
      consumer
        // graphiql
        .apply(graphiqlExpress({ endpointURL: '/graphql' }))
        .forRoutes({ path: '/graphiql', method: RequestMethod.GET });
    }
  }
}

import { Injectable } from '@nestjs/common';
import { GraphQLFactory, ResolveProperty, Resolver } from '@nestjs/graphql';
import { GraphQLServerOptions } from 'apollo-server-core/dist/graphqlOptions';
import * as DataLoader from 'dataloader';
import { Request } from 'express';
import { GraphQLSchema } from 'graphql';
import { IResolvers } from 'graphql-tools/dist/Interfaces';
import { Admin } from './admin/admin.entity';
import { AdminService } from './admin/admin.service';
import { DateResolver } from './scalars/date';
import { SchoolService } from './school/school.service';
import { Seller } from './seller/seller.entity';
import { SellerService } from './seller/seller.service';
import { IContext, IService } from './util';

@Resolver('User')
export class UserResolver {
  @ResolveProperty()
  __resolveType(user: Admin | Seller) {
    if (user instanceof Seller) {
      return 'Seller';
    }
    if (user instanceof Admin) {
      return 'Admin';
    }
    return null;
  }
}

const makeLoader = <T>(service: IService<T>) =>
  new DataLoader((ids: string[]) => service.getMany(ids));

@Injectable()
export class Schema {
  constructor(
    private readonly graphQLFactory: GraphQLFactory,
    private readonly sellerService: SellerService,
    private readonly adminService: AdminService,
    private readonly schoolService: SchoolService,
  ) {}

  private schema: GraphQLSchema | undefined = undefined;

  createSchema() {
    const typeDefs = this.graphQLFactory.mergeTypesByPaths('./**/*.gql');
    const resolvers: IResolvers<Request, IContext> = { Date: DateResolver };
    const schema: GraphQLSchema = this.graphQLFactory.createSchema({
      typeDefs,
      resolvers,
    });
    return schema;
  }

  getConfig(req: Request): GraphQLServerOptions<IContext> {
    if (!this.schema) {
      this.schema = this.createSchema();
    }

    const context: IContext = {
      user: req.user,
      req,
      sellerLoader: makeLoader(this.sellerService),
      adminLoader: makeLoader(this.adminService),
      schoolLoader: makeLoader(this.schoolService),
    };
    return {
      schema: this.schema,
      rootValue: req,
      context,
    };
  }
}

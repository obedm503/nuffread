import { Mutation, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { IContext } from '../util';
import { SchoolService } from './school.service';

@Resolver('School')
export class SchoolResolver {
  constructor(private readonly schoolService: SchoolService) {}

  @Mutation()
  async createSchool(
    req: Request,
    args: GQL.ICreateSchoolOnMutationArguments,
    ctx: IContext,
  ) {
    // await guard(ctx, Scopes.CREATE_USER, args);
    return this.schoolService.create(args.school);
  }

  @Mutation()
  async deleteSchool(
    req: Request,
    args: GQL.IDeleteSchoolOnMutationArguments,
    ctx: IContext,
  ) {
    try {
      // await guard(ctx, Scopes.DELETE_USER);
      await this.schoolService.delete(args.id);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

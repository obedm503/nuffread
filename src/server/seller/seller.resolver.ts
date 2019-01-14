import { Mutation, ResolveProperty, Resolver } from '@nestjs/graphql';
import { Request } from 'express';
import { IContext, IResolver } from '../util';
import { Seller } from './seller.entity';
import { SellerService } from './seller.service';

@Resolver('Seller')
export class SellerResolver implements IResolver<GQL.ISeller, Seller> {
  constructor(private readonly service: SellerService) {}

  @ResolveProperty()
  school({ schoolId }: Seller, args, { schoolLoader }: IContext) {
    return schoolLoader.load(schoolId);
  }

  @Mutation()
  async createSeller(
    req: Request,
    args: GQL.ICreateSellerOnMutationArguments,
    ctx: IContext,
  ) {
    // await guard(ctx, Scopes.CREATE_USER, args);
    return this.service.create(args.seller);
  }

  @Mutation()
  async deleteSeller(
    req: Request,
    args: GQL.IDeleteSellerOnMutationArguments,
    ctx: IContext,
  ) {
    try {
      // await guard(ctx, Scopes.DELETE_USER);
      await this.service.delete(args.id);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

import { Resolver } from '@nestjs/graphql';
import { AdminService } from './admin.service';

@Resolver('Admin')
export class AdminResolver {
  constructor(private readonly service: AdminService) {}
}

import { IPaginationInput } from './schema.gql';

export function paginationOptions(paginate?: IPaginationInput): {
  take: number;
  skip?: number;
} {
  return { take: paginate?.limit || 10, skip: paginate?.offset };
}

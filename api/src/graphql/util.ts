import { SelectQueryBuilder } from 'typeorm';
import { Listing, User } from '../db/entities';
import { GetMe, Session } from '../types';
import { userSession } from './auth';
import { IPaginationInput } from './schema.gql';

export async function sameSchoolListings({
  session,
  getMe,
}: {
  session?: Session;
  getMe: GetMe;
}): Promise<SelectQueryBuilder<Listing>> {
  const query = Listing.createQueryBuilder('listing');

  if (userSession(session)) {
    const me = await getMe();
    if (me instanceof User) {
      query.innerJoin('listing.user', 'user', 'user.schoolId = :schoolId', {
        schoolId: me.schoolId,
      });
    }
  }

  return query;
}

export function paginationOptions(
  paginate?: IPaginationInput,
): { take: number; skip?: number } {
  return { take: paginate?.limit || 10, skip: paginate?.offset };
}

import { School } from '../entities';
import { ISchool } from '../schema.gql';
import { ensureAdmin } from '../util/auth';
import { IResolver } from '../util/types';

export const SchoolResolver: IResolver<ISchool, School> = {
  async domain({ domain }, args, { session }) {
    ensureAdmin(session);

    return domain;
  },
};

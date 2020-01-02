import { ISchoolResolvers } from '../schema.gql';
import { ensureAdmin } from '../util/auth';

export const SchoolResolver: ISchoolResolvers = {
  async domain({ domain }, {}, { session }) {
    ensureAdmin(session);

    return domain;
  },
};

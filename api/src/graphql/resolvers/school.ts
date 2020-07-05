import { ensureAdmin } from '../auth';
import { ISchoolResolvers } from '../schema.gql';

export const SchoolResolver: ISchoolResolvers = {
  async domain({ domain }, {}, { session }) {
    ensureAdmin(session);

    return domain;
  },
};

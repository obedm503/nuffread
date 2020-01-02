import { IInviteResolvers } from '../schema.gql';
import { ensureAdmin } from '../util/auth';

export const InviteResolver: IInviteResolvers = {
  async user({ email, user }, {}, { session, userEmailLoader }) {
    ensureAdmin(session);

    return user || (await userEmailLoader.load(email));
  },
};

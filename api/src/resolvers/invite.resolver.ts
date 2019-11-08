import { Invite } from '../entities';
import { IInvite } from '../schema.gql';
import { ensureAdmin } from '../util/auth';
import { IResolver } from '../util/types';

export const InviteResolver: IResolver<IInvite, Invite> = {
  async user({ email, user }, args, { me, userEmailLoader }) {
    ensureAdmin(me);

    return user || (await userEmailLoader.load(email));
  },
};

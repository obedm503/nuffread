import { Invite, User } from '../entities';
import { IInvite, IUser } from '../schema.gql';
import { ensureAdmin } from '../util/auth';
import { IResolver } from '../util/types';

export const InviteResolver: IResolver<IInvite, Invite> = {
  async user({ email, user }, args, { me }): Promise<IUser> {
    ensureAdmin(me);

    return user || ((await User.findOne({ where: { email } })) as any);
  },
};

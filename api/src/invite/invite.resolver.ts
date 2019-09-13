import { IInvite, IUser } from '../schema.gql';
import { User } from '../user/user.entity';
import { isAdmin } from '../util/auth';
import { IResolver } from '../util/types';
import { Invite } from './invite.entity';

export const InviteResolver: IResolver<IInvite, Invite> = {
  async user({ email, user }, args, { me }): Promise<IUser> {
    isAdmin(me);

    return user || ((await User.findOne({ where: { email } })) as any);
  },
};

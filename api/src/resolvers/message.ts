import { IMessageResolvers } from '../schema.gql';
import { ensureUser } from '../util/auth';
import { ThreadNotFound, UserNotFound } from '../util/error';

export const MessageResolver: IMessageResolvers = {
  async from({ fromId }, {}, { session, userLoader }) {
    ensureUser(session);
    const user = await userLoader.load(fromId);
    if (!user) {
      throw new UserNotFound({ id: fromId, session });
    }
    return user;
  },
  async to({ toId }, {}, { session, userLoader }) {
    ensureUser(session);
    const user = await userLoader.load(toId);
    if (!user) {
      throw new UserNotFound({ id: toId, session });
    }
    return user;
  },
  async thread({ threadId }, {}, { session, threadLoader }) {
    ensureUser(session);
    const thread = await threadLoader.load(threadId);
    if (!thread) {
      throw new ThreadNotFound({ id: threadId, session });
    }
    return thread;
  },
};

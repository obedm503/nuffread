import { Message } from '../../db/entities';
import { ensureUser } from '../auth';
import { ListingNotFound, UserNotFound } from '../error';
import { IThreadResolvers } from '../schema.gql';
import { paginationOptions } from '../util';

export const ThreadResolver: IThreadResolvers = {
  otherId({ buyerId, sellerId }, {}, { session }) {
    ensureUser(session);
    return session.userId === buyerId ? sellerId : buyerId;
  },
  async other({ buyerId, sellerId }, {}, { session, userLoader }) {
    ensureUser(session);
    const otherId = session.userId === buyerId ? sellerId : buyerId;

    const user = await userLoader().load(otherId);
    if (!user) {
      throw new UserNotFound({ id: otherId, session });
    }
    return user;
  },
  async buyer({ buyerId }, {}, { session, userLoader }) {
    ensureUser(session);
    const user = await userLoader().load(buyerId);
    if (!user) {
      throw new UserNotFound({ id: buyerId, session });
    }
    return user;
  },
  async seller({ sellerId }, {}, { session, userLoader }) {
    ensureUser(session);
    const user = await userLoader().load(sellerId);
    if (!user) {
      throw new UserNotFound({ id: sellerId, session });
    }
    return user;
  },
  async listing({ listingId }, {}, { session, listingLoader }) {
    ensureUser(session);
    const listing = await listingLoader().load(listingId);
    if (!listing) {
      throw new ListingNotFound({ id: listingId, session });
    }
    return listing;
  },
  async messages({ id }, { paginate }) {
    const { take, skip } = paginationOptions(paginate);
    const [items, totalCount] = await Message.findAndCount({
      where: { threadId: id },
      take,
      skip,
      order: { createdAt: 'DESC' },
    });
    return { items, totalCount };
  },
  async lastMessage({ id }) {
    const items = await Message.find({
      where: { threadId: id },
      take: 1,
      order: { createdAt: 'DESC' },
    });
    return items.length ? items[0] : undefined;
  },
};

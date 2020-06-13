import { Message } from '../entities';
import { IThreadResolvers } from '../schema.gql';
import { paginationOptions } from '../util';
import { ensureUser } from '../util/auth';
import { ListingNotFound, UserNotFound } from '../util/error';

export const ThreadResolver: IThreadResolvers = {
  async buyer({ buyerId }, {}, { session, userLoader }) {
    ensureUser(session);
    const user = await userLoader.load(buyerId);
    if (!user) {
      throw new UserNotFound({ id: buyerId, session });
    }
    return user;
  },
  async seller({ sellerId }, {}, { session, userLoader }) {
    ensureUser(session);
    const user = await userLoader.load(sellerId);
    if (!user) {
      throw new UserNotFound({ id: sellerId, session });
    }
    return user;
  },
  async listing({ listingId }, {}, { session, listingLoader }) {
    ensureUser(session);
    const listing = await listingLoader.load(listingId);
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
};

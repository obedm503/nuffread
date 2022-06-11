import { Channel, Channels, subscriptions } from '../../pubsub';
import { ensureUser } from '../auth';
import { ISubscriptionResolvers } from '../schema.gql';

async function* filter<T extends keyof Channels>(
  source: Channel<T>,
  filterFn: (item: Channels[T]) => boolean,
): Channel<T> {
  for await (const item of source) {
    if (filterFn(item)) {
      yield item;
    }
  }
}

export const SubscriptionResolver: ISubscriptionResolvers = {
  newMessage: {
    subscribe(_, {}, { session }) {
      ensureUser(session);

      return filter(
        subscriptions.get('NEW_MESSAGE'),
        ({ newMessage }) => newMessage.toId === session.userId,
      );
    },
  },
};

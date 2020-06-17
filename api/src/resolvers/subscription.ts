import { ISubscriptionResolvers } from '../schema.gql';
import { ensureUser } from '../util/auth';
import { Channel, subscriptions } from '../util/pubsub';

async function* filter<T>(
  source: Channel<T>,
  filterFn: (item: T) => boolean,
): Channel<T> {
  for await (const item of source) {
    if (filterFn(item)) {
      yield item;
    }
  }
}

export const SubscriptionResolver: ISubscriptionResolvers = {
  newMessage: {
    // TODO: must use a plain function instead of AsyncGenerator until
    // https://github.com/apollographql/subscriptions-transport-ws/issues/182
    // is resolved. If not error response is not correctly formatted
    async subscribe(_, {}, { session }) {
      ensureUser(session);

      return filter(
        subscriptions.get('NEW_MESSAGE'),
        ({ newMessage }) => newMessage.toId === session.userId,
      );
    },
  },
};

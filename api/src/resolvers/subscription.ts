import { ISubscriptionResolvers } from '../schema.gql';
import { ensureUser } from '../util/auth';
import { subscriptions } from '../util/pubsub';

export const SubscriptionResolver: ISubscriptionResolvers = {
  newMessage: {
    resolve: m => m,
    // subscribe(_, {}, { session }) {
    //   ensureUser(session);

    //   return (async function* () {
    //     for await (const msg of bus.get('NEW_MESSAGE')) {
    //       console.log('NEW_MESSAGE', msg);
    //       if (!!session && msg.toId === session.userId) {
    //         yield msg;
    //       }
    //     }
    //   })();
    // },
    async *subscribe(_, {}, { session }) {
      ensureUser(session);

      for await (const msg of subscriptions.get('NEW_MESSAGE')) {
        console.log('NEW_MESSAGE', msg);
        if (!!session && msg.toId === session.userId) {
          yield msg;
        }
      }
    },
  },
};

import { PubSub } from 'apollo-server-express';
import { Message } from './db/entities';

const engine = new PubSub();
export type Channel<T> = AsyncIterator<T, any, undefined> & {
  [Symbol.asyncIterator](): Channel<T>;
};

const NEW_MESSAGE = 'NEW_MESSAGE';

export const subscriptions = new (class {
  get(channel: typeof NEW_MESSAGE): Channel<{ newMessage: Message }>;
  get(channel: string) {
    return engine.asyncIterator(channel);
  }
  newMessage(m: Message) {
    return engine.publish(NEW_MESSAGE, { newMessage: m });
  }
})();

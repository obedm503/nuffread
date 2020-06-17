import { PubSub } from 'apollo-server-express';
import { Message } from '../entities';

const engine = new PubSub();
type Channel<T> = AsyncIterator<T, any, undefined> & {
  [Symbol.asyncIterator](): Channel<T>;
};
export const subscriptions = {
  get(channel: 'NEW_MESSAGE'): Channel<Message> {
    return engine.asyncIterator(channel) as any;
  },
  newMessage(m: Message) {
    return engine.publish('NEW_MESSAGE', m);
  },
};

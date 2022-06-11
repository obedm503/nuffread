import { PubSub } from 'graphql-subscriptions';
import { Message } from './db/entities';

const engine = new PubSub();

const NEW_MESSAGE = 'NEW_MESSAGE';

export type Channels = {
  [NEW_MESSAGE]: { newMessage: Message };
};
export type Channel<T extends keyof Channels> = AsyncIterator<Channels[T], any, undefined> & {
  [Symbol.asyncIterator](): Channel<T>;
};

export const subscriptions = {
  get<T extends keyof Channels>(channel: T) {
    return engine.asyncIterator<Channels[T]>(channel) as Channel<T>;
  },
  newMessage(m: Message) {
    return engine.publish(NEW_MESSAGE, { newMessage: m });
  },
};

import * as React from 'react';
import { User } from '../schema.gql';

export type UserState = {
  user?: User;
};

const { Provider: UserProvider, Consumer: UserConsumer } = React.createContext<
  UserState
>({ user: undefined });

export { UserProvider, UserConsumer };

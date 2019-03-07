import * as React from 'react';

export type UserState = {
  user?: GQL.User;
};

const { Provider: UserProvider, Consumer: UserConsumer } = React.createContext<
  UserState
>({ user: undefined });

export { UserProvider, UserConsumer };

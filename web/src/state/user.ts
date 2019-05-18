import * as React from 'react';
import { SystemUser } from '../schema.gql';

export type UserState = {
  me?: SystemUser;
};

const { Provider: UserProvider, Consumer: UserConsumer } = React.createContext<
  UserState
>({ me: undefined });

export { UserProvider, UserConsumer };

import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { SellPrivate } from './sell-private';
import { SellPublic } from './sell-public';
import { UserConsumer } from './state/user';

export const Sell: React.SFC<RouteComponentProps<any>> = props => (
  <UserConsumer>
    {({ user }) => {
      if (user) {
        return <SellPrivate {...props} />;
      }
      return <SellPublic {...props} />;
    }}
  </UserConsumer>
);

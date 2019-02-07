import { NavbarItem } from 'bloomer';
import gql from 'graphql-tag';
import * as React from 'react';
import { Mutation } from 'react-apollo';

const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export class Logout extends React.PureComponent {
  onCompleted = (data: GQL.IMutation) => {
    if (data && data.logout && typeof location !== 'undefined') {
      location.href = '/';
    }
  };
  render() {
    return (
      <Mutation<GQL.IMutation> mutation={LOGOUT} onCompleted={this.onCompleted}>
        {mutate => {
          return (
            <NavbarItem href="#" onClick={() => mutate()}>
              <span>Logout</span>
            </NavbarItem>
          );
        }}
      </Mutation>
    );
  }
}

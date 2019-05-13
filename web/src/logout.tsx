import { IonItem, IonLabel } from '@ionic/react';
import gql from 'graphql-tag';
import * as React from 'react';
import { Mutation } from 'react-apollo';
import { IMutation } from './schema.gql';

const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export class Logout extends React.PureComponent {
  onCompleted = (data: IMutation) => {
    if (data && data.logout && typeof location !== 'undefined') {
      location.href = '/';
    }
  };
  render() {
    return (
      <Mutation<IMutation> mutation={LOGOUT} onCompleted={this.onCompleted}>
        {mutate => {
          return (
            <IonItem href="#" onClick={() => mutate()}>
              <IonLabel>Logout</IonLabel>
            </IonItem>
          );
        }}
      </Mutation>
    );
  }
}

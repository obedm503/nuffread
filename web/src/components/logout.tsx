import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import gql from 'graphql-tag';
import { logOut } from 'ionicons/icons';
import * as React from 'react';
import { Mutation } from 'react-apollo';
import { IMutation } from '../schema.gql';

const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export class Logout extends React.PureComponent {
  onCompleted = (data: IMutation) => {
    if (
      data &&
      data.logout &&
      typeof window !== 'undefined' &&
      window.location
    ) {
      window.location.href = '/';
    }
  };
  render() {
    return (
      <Mutation<IMutation> mutation={LOGOUT} onCompleted={this.onCompleted}>
        {mutate => {
          return (
            <IonItem button onClick={() => mutate()}>
              <IonIcon slot="start" icon={logOut} />
              <IonLabel>Logout</IonLabel>
            </IonItem>
          );
        }}
      </Mutation>
    );
  }
}

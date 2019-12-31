import { IonButton, IonIcon, IonItem, IonLabel } from '@ionic/react';
import gql from 'graphql-tag';
import { logOut } from 'ionicons/icons';
import * as React from 'react';
import { IMutation } from '../schema.gql';
import { useMutation } from '../state/apollo';
import { tracker } from '../state/tracker';

const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

const onCompleted = (data?: IMutation) => {
  tracker.logout();

  if (data?.logout && window?.location) {
    window.location.href = '/';
  }
};
const useLogout = () => {
  const [mutate] = useMutation(LOGOUT, { onCompleted });
  return React.useCallback(() => mutate(), [mutate]);
};

export const LogoutItem = () => {
  const onClick = useLogout();
  return (
    <IonItem button onClick={onClick}>
      <IonIcon slot="start" icon={logOut} />
      <IonLabel>Logout</IonLabel>
    </IonItem>
  );
};

export const LogoutButton = () => {
  const onClick = useLogout();
  return (
    <IonButton onClick={onClick}>
      <IonIcon slot="start" icon={logOut} />
      <IonLabel>Logout</IonLabel>
    </IonButton>
  );
};

import { IonButton, IonIcon, IonItem, IonLabel } from '@ionic/react';
import gql from 'graphql-tag';
import { logOutOutline } from 'ionicons/icons';
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

const LogoutIcon = () => <IonIcon slot="start" icon={logOutOutline} />;

export const LogoutItem = () => {
  const onClick = useLogout();
  return (
    <IonItem button onClick={onClick} detail={false}>
      <LogoutIcon />
      <IonLabel>Logout</IonLabel>
    </IonItem>
  );
};

export const LogoutButton = () => {
  const onClick = useLogout();
  return (
    <IonButton onClick={onClick}>
      <LogoutIcon />
      <IonLabel>Logout</IonLabel>
    </IonButton>
  );
};

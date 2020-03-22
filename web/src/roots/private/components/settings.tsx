import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonModal,
  IonToggle,
  IonToolbar,
} from '@ionic/react';
import gql from 'graphql-tag';
import { close, settings } from 'ionicons/icons';
import React from 'react';
import { Title } from '../../../components';
import { useMutation } from '../../../state/apollo';
import { useUser } from '../../../state/user';

export const useSettingsModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const handleOpen = React.useCallback(() => setIsOpen(true), []);
  const handleClose = React.useCallback(() => setIsOpen(false), []);
  return { isOpen, handleOpen, handleClose };
};

export const SettingsButton = React.memo<{ onClick }>(
  ({ onClick: handleClick }) => (
    <IonItem onClick={handleClick} button lines="none" detail={false}>
      <IonIcon slot="start" icon={settings} />
      <IonLabel>Settings</IonLabel>
    </IonItem>
  ),
);

const TOGGLE_TRACKING = gql`
  mutation ToggleTracking {
    toggleUserTrackable {
      id
      isTrackable
    }
  }
`;
const ToggleTracking = React.memo(() => {
  const user = useUser();
  const checked = user?.__typename === 'User' && user.isTrackable;

  const [mutate, { loading }] = useMutation(TOGGLE_TRACKING, {
    optimisticResponse: {
      __typename: 'Mutation',
      toggleUserTrackable: { ...user, isTrackable: !checked },
    } as any,
  });
  const onChange = React.useCallback(
    ({ detail }) => {
      // this check is necessary because ionic dispatches change event even
      // when `checked` changed without user interaction
      // https://github.com/ionic-team/ionic/pull/19509
      if (loading || detail.checked === checked) {
        return;
      }
      mutate();
    },
    [mutate, checked, loading],
  );

  return (
    <IonToggle
      slot="end"
      color="danger"
      disabled={loading}
      checked={checked}
      onIonChange={onChange}
    />
  );
});

export const SettingsModal = React.memo<{ isOpen: boolean; onClose }>(
  ({ isOpen, onClose: handleClose }) => (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar color="white">
          <Title title="Settings" homeHref={false} />

          <IonButtons slot="secondary">
            <IonButton onClick={handleClose}>
              <IonIcon slot="icon-only" icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonListHeader>
            <IonLabel color="primary">Privacy</IonLabel>
          </IonListHeader>

          <IonItem>
            <IonLabel className="ion-text-wrap">
              Send usage data
              <br />
              <small>
                Allow us to track how you use nuffread in order to improve it.
              </small>
            </IonLabel>

            <ToggleTracking />
          </IonItem>
        </IonList>
      </IonContent>
    </IonModal>
  ),
);

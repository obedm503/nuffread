import { IonButtons, IonContent, IonPage } from '@ionic/react';
import * as React from 'react';
import { Popover, TopNav } from '../../components';
import { Logout } from '../../components/logout';

export const Profile = () => (
  <IonPage>
    <TopNav>
      <IonButtons slot="end">
        <Popover>
          <Logout />
        </Popover>
      </IonButtons>
    </TopNav>

    <IonContent>my profile</IonContent>
  </IonPage>
);

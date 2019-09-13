import { IonButtons, IonContent, IonPage } from '@ionic/react';
import * as React from 'react';
import { Popover, TopNav, LogoutItem } from '../../components';

export const Profile = () => (
  <IonPage>
    <TopNav>
      <IonButtons slot="end">
        <Popover>
          <LogoutItem />
        </Popover>
      </IonButtons>
    </TopNav>

    <IonContent>my profile</IonContent>
  </IonPage>
);

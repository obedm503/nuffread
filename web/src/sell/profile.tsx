import { IonContent, IonButtons } from '@ionic/react';
import * as React from 'react';
import { TopNav } from '../components';
import { Logout } from '../logout';
import { Popover } from '../components/popover';

export const Profile = () => (
  <>
    <TopNav>
      <IonButtons slot="end">
        <Popover>
          <Logout />
        </Popover>
      </IonButtons>
    </TopNav>

    <IonContent>my profile</IonContent>
  </>
);

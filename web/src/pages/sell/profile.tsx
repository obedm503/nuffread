import { IonButtons, IonContent } from '@ionic/react';
import * as React from 'react';
import { Popover, TopNav } from '../../components';
import { Logout } from '../logout';

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

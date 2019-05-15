import { IonButton, IonButtons } from '@ionic/react';
import * as React from 'react';
import { TopNav } from '../../components';

export const Nav: React.SFC = ({ children }) => (
  <TopNav toolbar={children}>
    <IonButtons slot="secondary">
      <IonButton href="/join">
        <b>Join</b>
      </IonButton>
      <IonButton href="/login">Login</IonButton>
    </IonButtons>
  </TopNav>
);

import { IonButtons } from '@ionic/react';
import * as React from 'react';
import { IonButtonLink, TopNav } from '../../components';

export const Nav: React.SFC = ({ children }) => (
  <TopNav toolbar={children}>
    <IonButtons slot="secondary">
      <IonButtonLink href="/join">
        <b>Join</b>
      </IonButtonLink>
      <IonButtonLink href="/login">Login</IonButtonLink>
    </IonButtons>
  </TopNav>
);

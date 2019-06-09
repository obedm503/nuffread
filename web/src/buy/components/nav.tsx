import { IonButtons } from '@ionic/react';
import * as React from 'react';
import { IonBackButton, IonButtonLink, TopNav } from '../../components';
import { OnlyMobile } from '../../state/desktop';

export const Nav: React.SFC<{ title?: string }> = ({ children, title }) => (
  <TopNav toolbar={children} title={title}>
    <OnlyMobile>
      {() => (
        <IonButtons slot="start">
          <IonBackButton defaultHref="/" />
        </IonButtons>
      )}
    </OnlyMobile>

    <IonButtons slot="end">
      <IonButtonLink href="/join">
        <b>Join</b>
      </IonButtonLink>
      <IonButtonLink href="/login">Login</IonButtonLink>
    </IonButtons>
  </TopNav>
);

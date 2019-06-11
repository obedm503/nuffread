import { IonButtons } from '@ionic/react';
import * as React from 'react';
import { IonBackButton, IonButtonLink, TopNav } from '../../components';
import { OnlyMobile } from '../../state/desktop';

const GoBack = () => (
  <IonButtons slot="start">
    <IonBackButton defaultHref="/listings" />
  </IonButtons>
);

export const Nav: React.SFC<{ title?: string; alwaysBack?: boolean }> = ({
  children,
  title,
  alwaysBack = false,
}) => (
  <TopNav toolbar={children} title={title}>
    {alwaysBack ? <GoBack /> : <OnlyMobile children={GoBack} />}

    <IonButtons slot="end">
      <IonButtonLink href="/join">
        <b>Join</b>
      </IonButtonLink>
      <IonButtonLink href="/login">Login</IonButtonLink>
    </IonButtons>
  </TopNav>
);

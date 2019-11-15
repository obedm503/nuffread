import { IonBackButton, IonButtons } from '@ionic/react';
import * as React from 'react';
import { IonButtonLink, TopNav } from '../../../components';
import { OnlyMobile } from '../../../state/desktop';

export const Nav: React.FC<{
  title?: string;
  alwaysBack?: boolean;
  base: string;
}> = ({ children, title, alwaysBack = false, base }) => (
  <TopNav toolbar={children} title={title} homeHref={base}>
    <IonButtons slot="start">
      {alwaysBack ? (
        <IonBackButton defaultHref={base} />
      ) : (
        <OnlyMobile children={() => <IonBackButton defaultHref={base} />} />
      )}
    </IonButtons>

    <IonButtons slot="end">
      <IonButtonLink href="/join">
        <b>Join</b>
      </IonButtonLink>
      <IonButtonLink href="/login">Login</IonButtonLink>
    </IonButtons>
  </TopNav>
);

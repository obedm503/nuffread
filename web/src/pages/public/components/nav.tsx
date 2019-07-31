import { IonBackButton, IonButtons } from '@ionic/react';
import * as React from 'react';
import { IonButtonLink, TopNav } from '../../../components';
import { OnlyMobile } from '../../../state';

const GoBack = ({ base }) => (
  <IonButtons slot="start">
    <IonBackButton defaultHref={base} />
  </IonButtons>
);

export const Nav: React.SFC<{
  title?: string;
  alwaysBack?: boolean;
  base: string;
}> = ({ children, title, alwaysBack = false, base }) => (
  <TopNav toolbar={children} title={title}>
    {alwaysBack ? (
      <GoBack base={base} />
    ) : (
      <OnlyMobile children={() => <GoBack base={base} />} />
    )}

    <IonButtons slot="end">
      <IonButtonLink href="/join">
        <b>Join</b>
      </IonButtonLink>
      <IonButtonLink href="/login">Login</IonButtonLink>
    </IonButtons>
  </TopNav>
);

import { IonButtons } from '@ionic/react';
import * as React from 'react';
import { IonButtonLink, TopNav } from '../../../components';
import { GoBack } from '../../../components/go-back';
import { OnlyMobile } from '../../../state';

export const Nav: React.FC<{
  title?: string;
  alwaysBack?: boolean;
  base: string;
}> = ({ children, title, alwaysBack = false, base }) => (
  <TopNav toolbar={children} title={title}>
    <IonButtons slot="start">
      {alwaysBack ? (
        <GoBack base={base} />
      ) : (
        <OnlyMobile children={() => <GoBack base={base} />} />
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

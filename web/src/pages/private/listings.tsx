import { IonContent, IonPage } from '@ionic/react';
import * as React from 'react';
import { TopNav } from '../../components';
import { Container } from '../../components/container';

export const MyListings = React.memo(function MyListings() {
  return (
    <IonPage>
      <TopNav homeHref="/explore"></TopNav>

      <IonContent>
        <Container></Container>
      </IonContent>
    </IonPage>
  );
});

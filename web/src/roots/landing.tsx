import {
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonText,
  IonToolbar,
} from '@ionic/react';
import memoize from 'lodash/memoize';
import * as React from 'react';
import { IonButtonLink, IonRoutes, RequestInvite, Title } from '../components';
import { Book } from '../pages/book';
import { Listing } from '../pages/listing';
import { RootPageProps } from '../util.types';

const Landing = React.memo(function Landing() {
  return (
    <IonPage>
      <IonHeader>
        <IonGrid className="no-padding">
          <IonRow>
            <IonCol sizeMd="10" offsetMd="1">
              <IonToolbar color="white">
                <Title homeHref="/" />

                <IonButtons slot="end">
                  <IonButtonLink href="/login">Login</IonButtonLink>
                </IonButtons>
              </IonToolbar>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonHeader>

      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="10" offset="1" sizeMd="4">
              <h1>
                <IonText color="primary">nuffread</IonText> is
              </h1>

              <IonList lines="inset">
                <IonItem>Open book marketplace</IonItem>
                <IonItem>Transparent</IonItem>
                <IonItem>Closed alpha stage</IonItem>
              </IonList>
            </IonCol>

            <IonCol size="12" sizeMd="5" offsetMd="1" sizeLg="4" offsetLg="2">
              <RequestInvite />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
});

const getRoutes = memoize(globalRoutes =>
  globalRoutes.concat(
    {
      path: '/p/:listingId',
      component: ({ match }) => (
        <Listing id={match.params.listingId} defaultHref={false} />
      ),
    },
    {
      path: '/b/:bookId',
      component: ({ match }) => (
        <Book bookId={match.params.bookId} defaultHref={false} />
      ),
    },
    { path: '/', component: Landing },
  ),
);

export default React.memo<RootPageProps>(function({ globalRoutes }) {
  return <IonRoutes routes={getRoutes(globalRoutes)} />;
});

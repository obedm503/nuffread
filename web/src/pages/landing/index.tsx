import {
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonText,
} from '@ionic/react';
import * as React from 'react';
import { Redirect } from 'react-router';
import { TopNav } from '../../components';
import { useRouter } from '../../state/router';

export const Landing = () => {
  const { location } = useRouter();
  if (location.pathname !== '/') {
    return <Redirect to="/" />;
  }

  return (
    <>
      <TopNav />

      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="10" offset="1" sizeMd="4">
              <h1>
                <IonText color="primary">nuffread</IonText> is
              </h1>

              <IonList lines="inset">
                <IonItem>Open book markerplace</IonItem>
                <IonItem>Transparent</IonItem>
                <IonItem>Closed alpha stage</IonItem>
              </IonList>
            </IonCol>

            <IonCol size="10" offset="1" sizeMd="4" offsetMd="2">
              <h1>Request early access</h1>

              <form name="early-access" method="POST" data-netlify="true">
                <input type="hidden" name="form-name" value="early-access" />
                <IonList lines="full">
                  <IonItem>
                    <IonLabel position="floating">Your Name</IonLabel>
                    <IonInput name="name" required />
                  </IonItem>

                  <IonItem>
                    <IonLabel position="floating">Your Email</IonLabel>
                    <IonInput name="email" required type="email" />
                  </IonItem>

                  <div className="ion-padding">
                    <IonButton expand="block" type="submit">
                      Request
                    </IonButton>
                  </div>
                </IonList>
              </form>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </>
  );
};

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
            <IonCol size="10" offset="1" sizeMd="6">
              <h1>
                <IonText color="primary">nuffread</IonText> is
              </h1>
              <ul>
                <li>open book marketplace</li>
                <li>free</li>
                <li>convenient</li>
                <li>transparent</li>
                <li>experiment</li>
                <li>closed alpha</li>
              </ul>
            </IonCol>

            <IonCol size="10" offset="1" sizeMd="4" offsetMd="0">
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

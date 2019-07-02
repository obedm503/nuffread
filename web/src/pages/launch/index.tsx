import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import * as React from 'react';

export const Launch = () => (
  <>
    <IonHeader>
      <IonToolbar color="white">
        <IonTitle color="primary">
          <b>nuffread</b>
        </IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent>
      <IonGrid>
        <IonRow>
          <IonCol sizeMd="4" offsetMd="4" sizeSm="8" offsetSm="1">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Request early access</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <form name="early-access" method="POST" data-netlify="true">
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
                        Submit
                      </IonButton>
                    </div>
                  </IonList>
                </form>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  </>
);

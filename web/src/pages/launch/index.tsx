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
import { TopNav } from '../../components';

export const Launch = () => (
  <>
    <TopNav />

    <IonContent>
      <IonGrid>
        <IonRow>
          <IonCol size="10" offset="1" sizeMd="6">
            <p>
              explain what kind of <b>marketplace</b>{' '}
              <IonText color="primary">nuffread</IonText> is
            </p>
            <p>explain alpha status/ closed beta</p>
          </IonCol>

          <IonCol size="10" offset="1" sizeMd="4" offsetMd="0">
            <h2>Request early access</h2>

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

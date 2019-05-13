import {
  IonButton,
  IonButtons,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
} from '@ionic/react';
import * as React from 'react';

export const SellerDetails: React.SFC<{
  listingId: string;
}> = () => (
  <IonItem>
    <IonImg slot="start" src="/img/128x128.png" />

    <IonLabel text-wrap>
      <p>
        <strong>John Doe</strong>
        <br />
        <small>Dordt University</small>
        <br />
        <small>
          <a href="mailto: john.doe@mail.com">john.doe@mail.com</a>
        </small>
        <br />
        <small>
          <a href="tel: +123456789">+123456789</a>
        </small>
      </p>

      <IonButtons>
        <IonButton href="#">
          <IonIcon slot="icon-only" size="small" name="call" />
        </IonButton>
        <IonButton href="#">
          <IonIcon slot="icon-only" size="small" name="logo-facebook" />
        </IonButton>
        <IonButton href="#">
          <IonIcon slot="icon-only" size="small" name="mail" />
        </IonButton>
      </IonButtons>
    </IonLabel>
  </IonItem>
);

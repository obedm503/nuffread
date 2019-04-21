import { IonIcon, IonImg, IonItem } from '@ionic/react';
import * as React from 'react';

export const SellerDetails: React.SFC<{
  listingId: string;
}> = () => (
  <div>
    <div>
      <IonImg
        // isSize="128x128"
        src="/img/128x128.png"
      />
    </div>
    <div>
      <div>
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
      </div>
      <div>
        <div>
          <IonItem href="#">
            <IonIcon size="small" name="call" />
          </IonItem>
          <IonItem href="#">
            <IonIcon size="small" name="logo-facebook" />
          </IonItem>
          <IonItem href="#">
            <IonIcon size="small" name="mail" />
          </IonItem>
        </div>
      </div>
    </div>
  </div>
);

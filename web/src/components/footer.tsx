import { IonFooter, IonToolbar, IonTitle } from '@ionic/react';
import * as React from 'react';

export const Footer = () => (
  <IonFooter>
    <IonToolbar color="light">
      <p style={{ textAlign: 'center' }}>
        <strong>nuffread</strong> &copy; Copyright {new Date().getFullYear()}
      </p>
    </IonToolbar>
  </IonFooter>
);

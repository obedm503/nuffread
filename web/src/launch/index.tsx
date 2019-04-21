import { IonContent, IonTitle, IonToolbar } from '@ionic/react';
import * as React from 'react';

export const Launch = () => (
  <>
    <IonToolbar>
      <IonTitle>nuffread</IonTitle>
    </IonToolbar>

    <IonContent color="light">
      <div style={{ display: 'flex', minHeight: '100%', alignItems: 'center' }}>
        <p style={{ margin: '5rem' }}>
          <h1 style={{ fontSize: '4rem' }}>Welcome,</h1>
          <h2 style={{ fontSize: '3rem' }}>nuffread is Coming Soon</h2>
        </p>
      </div>
    </IonContent>
  </>
);

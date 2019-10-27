import { IonCol, IonGrid, IonRow } from '@ionic/react';
import React from 'react';

export const Container = ({ children }) => (
  <IonGrid>
    <IonRow>
      <IonCol
        size="12"
        offset="0"
        sizeMd="10"
        offsetMd="1"
        sizeLg="8"
        offsetLg="2"
        sizeXl="4"
        offsetXl="4"
      >
        {children}
      </IonCol>
    </IonRow>
  </IonGrid>
);

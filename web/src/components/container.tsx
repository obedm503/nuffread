import { IonCol, IonGrid, IonRow } from '@ionic/react';
import React, { memo } from 'react';

export const Container = memo<{
  className?: string;
  children: React.ReactNode;
}>(function Container({ className, children }) {
  return (
    <IonGrid className={className}>
      <IonRow>
        <IonCol
          size="12"
          offset="0"
          sizeMd="10"
          offsetMd="1"
          sizeLg="8"
          offsetLg="2"
          sizeXl="6"
          offsetXl="3"
        >
          {children}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
});

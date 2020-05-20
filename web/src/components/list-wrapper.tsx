import { IonLabel, IonList, IonListHeader } from '@ionic/react';
import React from 'react';

export const ListWrapper: React.FC<{ title?: string }> = ({
  title,
  children,
}) => (
  <IonList>
    {title ? (
      <IonListHeader>
        <IonLabel>{title}</IonLabel>
      </IonListHeader>
    ) : null}

    {children}
  </IonList>
);

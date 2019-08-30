import { IonLabel, IonList, IonListHeader } from '@ionic/react';
import React, { FC } from 'react';

export const ListWrapper: FC<{ title?: string }> = ({ title, children }) => (
  <IonList>
    {title ? (
      <IonListHeader>
        <IonLabel>{title}</IonLabel>
      </IonListHeader>
    ) : null}

    {children}
  </IonList>
);

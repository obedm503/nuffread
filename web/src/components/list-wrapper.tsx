import { IonLabel, IonList, IonListHeader } from '@ionic/react';
import React, { CSSProperties } from 'react';

export const ListWrapper: React.FC<{
  title?: string;
  style?: CSSProperties;
}> = ({ title, children, style }) => (
  <IonList style={style}>
    {title ? (
      <IonListHeader>
        <IonLabel>{title}</IonLabel>
      </IonListHeader>
    ) : null}

    {children}
  </IonList>
);

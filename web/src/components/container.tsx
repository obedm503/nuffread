import { IonCol, IonGrid, IonRow } from '@ionic/react';
import React, { CSSProperties } from 'react';
import { classes } from '../util';

export const Container = React.memo<{
  className?: string;
  children: React.ReactNode;
  style?: CSSProperties;
  gapless?: boolean;
}>(function Container({ className, children, style, gapless }) {
  return (
    <IonGrid
      className={classes(className, gapless ? 'gapless' : '')}
      style={style}
    >
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

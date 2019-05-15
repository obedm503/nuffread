import { IonButton, IonTitle, IonToolbar, IonHeader } from '@ionic/react';
import * as React from 'react';
import { Color } from '../util';

type Props = {
  color?: Color;
  toolbar?: React.ReactNode;
};
export class TopNav extends React.PureComponent<Props> {
  render() {
    const { children, color, toolbar = null } = this.props;
    return (
      <IonHeader>
        <IonToolbar color={color}>
          <IonTitle>
            <IonButton href="/" color="light" fill="clear">
              nuffread
            </IonButton>
          </IonTitle>

          {children}
        </IonToolbar>

        {toolbar}
      </IonHeader>
    );
  }
}

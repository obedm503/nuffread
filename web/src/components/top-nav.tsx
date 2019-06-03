import { IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import * as React from 'react';

type Props = {
  toolbar?: React.ReactNode;
};
export class TopNav extends React.PureComponent<Props> {
  render() {
    const { children, toolbar = null } = this.props;
    return (
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>nuffread</IonTitle>

          {children}
        </IonToolbar>

        {toolbar}
      </IonHeader>
    );
  }
}

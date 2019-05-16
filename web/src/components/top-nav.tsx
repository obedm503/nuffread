import { IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import * as React from 'react';
import { IonButtonLink } from './ionic';

type Props = {
  toolbar?: React.ReactNode;
};
export class TopNav extends React.PureComponent<Props> {
  render() {
    const { children, toolbar = null } = this.props;
    return (
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <IonButtonLink href="/" fill="clear" color="light">
              nuffread
            </IonButtonLink>
          </IonTitle>

          {children}
        </IonToolbar>

        {toolbar}
      </IonHeader>
    );
  }
}

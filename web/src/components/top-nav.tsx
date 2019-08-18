import { IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';

type Props = {
  toolbar?: React.ReactNode;
  title?: string;
};
export class TopNav extends React.PureComponent<Props> {
  render() {
    const { children, toolbar = null } = this.props;
    const title = this.props.title || 'nuffread';
    return (
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title}</IonTitle>
          <Helmet>
            <title>{title}</title>
          </Helmet>

          {children}
        </IonToolbar>

        {toolbar}
      </IonHeader>
    );
  }
}

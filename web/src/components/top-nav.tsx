import { IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

type Props = {
  toolbar?: React.ReactNode;
  title?: string;
  homeHref: string | false;
};
export class TopNav extends React.PureComponent<Props> {
  render() {
    const { children, toolbar = null, homeHref: href } = this.props;
    const title = this.props.title || 'nuffread';
    return (
      <IonHeader>
        <IonToolbar color="white">
          <IonTitle color="primary">
            {href === false ? (
              title
            ) : (
              <Link to={href} style={{ textDecoration: 'none' }}>
                {title}
              </Link>
            )}
          </IonTitle>
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

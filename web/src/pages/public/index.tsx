import { IonContent } from '@ionic/react';
import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { Footer } from '../../components';
import { SearchPage } from '../../components/search';
import { Nav } from './components/nav';

export default class Public extends React.Component<RouteComponentProps> {
  render() {
    const path = this.props.location.pathname;
    if (path === '/') {
      return <Redirect to="/listings" />;
    }

    return (
      <>
        {path === '/listings' ? <Nav base="/listings" /> : null}

        <IonContent>
          <SearchPage {...this.props} base="/listings" />
        </IonContent>

        <Footer />
      </>
    );
  }
}

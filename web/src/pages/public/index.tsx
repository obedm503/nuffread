import { IonContent } from '@ionic/react';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Footer } from '../../components';
import { SearchPage } from '../../components/search';
import { Nav } from './components/nav';

export default class Public extends React.Component<RouteComponentProps> {
  render() {
    const path = this.props.location.pathname;

    return (
      <>
        {path === '/' ? <Nav base="/" /> : null}

        <IonContent>
          <SearchPage {...this.props} base="/" />
        </IonContent>

        <Footer />
      </>
    );
  }
}

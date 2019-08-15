import { IonContent } from '@ionic/react';
import React, { memo } from 'react';
import { Route, RouteComponentProps } from 'react-router';
import { SearchPage } from '../../components/search';
import { Nav } from './components/nav';

export default memo<RouteComponentProps>(props => {
  return (
    <>
      <Route path="/" exact render={() => <Nav base="/" />} />

      <IonContent>
        <SearchPage {...props} />
      </IonContent>
    </>
  );
});

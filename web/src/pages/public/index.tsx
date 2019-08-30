import {
  IonCol,
  IonContent,
  IonGrid,
  IonPage,
  IonRouterOutlet,
  IonRow,
} from '@ionic/react';
import { ViewManager } from '@ionic/react-router';
import React, { memo } from 'react';
import { Route, RouteComponentProps } from 'react-router';
import { ListingPage } from '../../components/listing-page';
import { SearchBar } from '../../components/search-bar';
import { useSearch } from '../../state/search';
import { Nav } from './components/nav';
import { SearchListings } from './components/search-results';
import { TopListings } from './components/top-listings';

const Master = () => {
  const { onClick, onSearch, searchValue } = useSearch();
  return (
    <IonPage>
      <Nav base="/" />

      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeLg="10" offsetLg="1">
              <SearchBar onSearch={onSearch} searchValue={searchValue} />

              {searchValue ? (
                <SearchListings onClick={onClick} searchValue={searchValue} />
              ) : (
                <TopListings onClick={onClick} />
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

const Detail = (routeProps: RouteComponentProps<{ listingId: string }>) => {
  return <ListingPage id={routeProps.match.params.listingId} base="/" />;
};

export default memo<RouteComponentProps>(() => {
  return (
    <ViewManager>
      <IonRouterOutlet>
        <Route path="/" exact component={Master} />
        <Route path="/:listingId" component={Detail} />
      </IonRouterOutlet>
    </ViewManager>
  );
});

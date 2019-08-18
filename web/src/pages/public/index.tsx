import { IonCol, IonContent, IonGrid, IonRow } from '@ionic/react';
import React, { memo } from 'react';
import { RouteComponentProps, RouteProps } from 'react-router';
import { IonRoutes } from '../../components';
import { ListingPage } from '../../components/listing-page';
import { SearchBar } from '../../components/search-bar';
import { useSearch } from '../../state/search';
import { Nav } from './components/nav';
import { SearchListings } from './components/search-results';
import { TopListings } from './components/top-listings';

const Master = () => {
  const { onClick, onSearch, searchValue } = useSearch();
  return (
    <>
      <Nav base="/">
        <SearchBar onSearch={onSearch} searchValue={searchValue} />
      </Nav>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeLg="10" offsetLg="1">
              {searchValue ? (
                <SearchListings onClick={onClick} searchValue={searchValue} />
              ) : (
                <TopListings onClick={onClick} />
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </>
  );
};

const Detail = (routeProps: RouteComponentProps<{ listingId: string }>) => {
  return <ListingPage id={routeProps.match.params.listingId} base="/" />;
};

export default memo<RouteComponentProps>(props => {
  const routes: RouteProps[] = [
    { path: '/:listingId', component: Detail },
    {
      path: '/',
      exact: true,
      component: Master,
    },
  ];
  return (
    <IonContent>
      <IonRoutes routes={routes} />
    </IonContent>
  );
});

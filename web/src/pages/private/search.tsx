import { IonCol, IonContent, IonGrid, IonPage, IonRow } from '@ionic/react';
import React, { memo } from 'react';
import { RouteComponentProps } from 'react-router';
import { TopNav } from '../../components';
import { ListingPage } from '../../components/listing-page';
import { SearchBar } from '../../components/search-bar';
import { useSearch } from '../../state/search';
import { SearchListings } from '../public/components/search-results';
import { TopListings } from '../public/components/top-listings';

export const Search = memo<RouteComponentProps>(props => {
  const { onClick, onSearch, searchValue } = useSearch();
  return (
    <IonPage>
      <TopNav />

      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeLg="10" offsetLg="1">
              {/* <SearchBar onSearch={onSearch} searchValue={searchValue} /> */}

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
});

export const Detail = (
  routeProps: RouteComponentProps<{ listingId: string }>,
) => {
  return <ListingPage id={routeProps.match.params.listingId} base="/search" />;
};

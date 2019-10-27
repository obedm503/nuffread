import { IonContent, IonPage } from '@ionic/react';
import React, { memo } from 'react';
import { RouteComponentProps } from 'react-router';
import { TopNav } from '../../components';
import { Container } from '../../components/container';
import { ListingPage } from '../../components/listing-page';
import { useSearch } from '../../state/search';
import { SearchListings } from '../public/components/search-results';
import { TopListings } from '../public/components/top-listings';
import { SearchBar } from '../../components/search-bar';

export const Search = memo<RouteComponentProps>(props => {
  const { onClick, onSearch, searchValue } = useSearch();
  return (
    <IonPage>
      <TopNav />

      <IonContent>
        <Container>
          <SearchBar onSearch={onSearch} searchValue={searchValue} />

          {searchValue ? (
            <SearchListings onClick={onClick} searchValue={searchValue} />
          ) : (
            <TopListings onClick={onClick} />
          )}
        </Container>
      </IonContent>
    </IonPage>
  );
});

export const Detail = (
  routeProps: RouteComponentProps<{ listingId: string }>,
) => {
  return <ListingPage id={routeProps.match.params.listingId} base="/home" />;
};

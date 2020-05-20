import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
} from '@ionic/react';
import gql from 'graphql-tag';
import React from 'react';
import {
  Container,
  Error,
  ListingBasic,
  Listings,
  ListWrapper,
  SearchBar,
  SearchBooks,
} from '../components';
import { BASIC_LISTING } from '../queries';
import { useQuery, useSearch } from '../state';

const GET_RECENT_LISTINGS = gql`
  ${BASIC_LISTING}

  query GetRecentListings {
    me {
      ... on User {
        id
        recent {
          ...BasicListing
        }
      }
    }
  }
`;
const RecentListings = React.memo<{ onClick: (id: string) => void }>(
  function RecentListings({ onClick }) {
    const { error, loading, data } = useQuery(GET_RECENT_LISTINGS);

    if (error) {
      return <Error value={error} />;
    }
    if (loading || !data) {
      return <ListWrapper title="Recent">{ListingBasic.loading}</ListWrapper>;
    }
    if (!data.me || data.me.__typename !== 'User') {
      return null;
    }

    return (
      <Listings
        title="Recent"
        loading={loading}
        listings={data.me.recent}
        component={ListingBasic}
        onClick={onClick}
      />
    );
  },
);

export const Search = React.memo(function Search() {
  const { onClick, onSearch, searchValue } = useSearch();
  return (
    <IonPage>
      <IonHeader>
        <Container className="no-padding">
          <SearchBar onChange={onSearch} searchValue={searchValue} autofocus>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/explore" />
            </IonButtons>
          </SearchBar>
        </Container>
      </IonHeader>

      <IonContent>
        <Container>
          {searchValue ? (
            <SearchBooks onClick={onClick} searchValue={searchValue} />
          ) : (
            <RecentListings onClick={onClick} />
          )}
        </Container>
      </IonContent>
    </IonPage>
  );
});

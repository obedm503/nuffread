import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
} from '@ionic/react';
import { gql } from '@apollo/client';
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
    const res = useQuery(GET_RECENT_LISTINGS);

    if (res.error) {
      return <Error value={res.error} />;
    }
    if (res.loading) {
      return <ListWrapper title="Recent">{ListingBasic.loading}</ListWrapper>;
    }
    if (!res.data.me || res.data.me.__typename !== 'User') {
      return null;
    }

    return (
      <Listings
        title="Recent"
        loading={res.loading}
        listings={res.data.me?.recent}
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

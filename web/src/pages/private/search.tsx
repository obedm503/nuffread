import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
} from '@ionic/react';
import gql from 'graphql-tag';
import React, { memo } from 'react';
import {
  Container,
  Error,
  ListingBasic,
  Listings,
  ListWrapper,
  SearchBar,
  SearchListings,
} from '../../components';
import { BASIC_LISTING } from '../../queries';
import { useQuery } from '../../state/apollo';
import { useSearch } from '../../state/search';

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
const RecentListings = memo<{ onClick: (id: string) => void }>(
  function RecentListings({ onClick }) {
    const { error, loading, data } = useQuery(GET_RECENT_LISTINGS);

    if (error) {
      return <Error value={error} />;
    }

    if (loading || !data || !data.me || data.me.__typename !== 'User') {
      return <ListWrapper title="Recent">{ListingBasic.loading}</ListWrapper>;
    }

    return (
      <Listings
        title="Recent"
        loading={loading}
        listings={data.me && data.me.recent}
        component={ListingBasic}
        onClick={onClick}
      />
    );
  },
);

export const Search = memo(function Search() {
  const { onClick, onSearch, searchValue } = useSearch('/search');
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
            <SearchListings onClick={onClick} searchValue={searchValue} />
          ) : (
            <RecentListings onClick={onClick} />
          )}
        </Container>
      </IonContent>
    </IonPage>
  );
});

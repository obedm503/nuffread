import { QueryResult } from '@apollo/react-common';
import { useApolloClient, useMutation, useQuery } from '@apollo/react-hooks';
import { RefresherEventDetail } from '@ionic/core';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonPage,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import ApolloClient, { MutationUpdaterFn } from 'apollo-client';
import gql from 'graphql-tag';
import { add } from 'ionicons/icons';
import * as React from 'react';
import { Error, TopNav } from '../../components';
import { Container } from '../../components/container';
import { ListingBasic } from '../../components/listing-basic';
import { MY_LISTINGS } from '../../queries';
import { IMutation, IQuery } from '../../schema.gql';
import { CreateListing } from './new';

const DELETE_LISTING = gql`
  mutation DeleteListing($id: ID!) {
    deleteListing(id: $id)
  }
`;

const update: (
  id: string,
  client: ApolloClient<object>,
) => MutationUpdaterFn<IMutation> = (id, client) => (cache, { data }) => {
  const success = data && data.deleteListing;
  if (!success) {
    return;
  }
  const listingsData = client.readQuery<IQuery>({ query: MY_LISTINGS });
  if (
    !listingsData ||
    !listingsData.me ||
    listingsData.me.__typename !== 'User' ||
    !listingsData.me.listings
  ) {
    return;
  }
  const listings = listingsData.me.listings;
  client.writeQuery({
    query: MY_LISTINGS,
    data: {
      ...listingsData,
      me: {
        ...listingsData.me,
        listings: listings.filter(item => item.id !== id),
      },
    },
  });
};

const useDelete = (id: string) => {
  const [mutate, { loading, error }] = useMutation<IMutation>(DELETE_LISTING);
  const client = useApolloClient();

  if (error) {
    throw error;
  }

  return {
    del: () => mutate({ variables: { id }, update: update(id, client) }),
    loading,
  };
};

const SlidingListing = ({ listing }) => {
  const { del, loading } = useDelete(listing.id);

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLIonItemOptionElement, MouseEvent>) => {
      if (!e.currentTarget) {
        return;
      }
      const t = e.currentTarget as HTMLIonItemOptionElement;
      const sliding = t.closest('ion-item-sliding');
      if (sliding) {
        del();
        sliding.close();
      }
    },
    [del],
  );

  return (
    <IonItemSliding>
      <ListingBasic listing={listing} disabled={loading} />

      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={onClick}>
          Delete
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
};

const Listings: React.FC<
  Pick<QueryResult<IQuery>, 'data' | 'error' | 'loading'>
> = ({ loading, error, data }) => {
  if (loading) {
    return <>{ListingBasic.loading}</>;
  }
  if (error || !data || !data.me || data.me.__typename !== 'User') {
    return <Error value={error} />;
  }

  if (!data.me.listings.length) {
    return <span>No listings posted</span>;
  }

  return (
    <>
      {data.me.listings.map(listing => (
        <SlidingListing key={listing.id} listing={listing}></SlidingListing>
      ))}
    </>
  );
};

export const MyListings: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);
  const { loading, error, data, refetch } = useQuery<IQuery>(MY_LISTINGS);

  const onRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await refetch();
    event.detail.complete();
  };

  return (
    <IonPage>
      <TopNav>
        <IonButtons slot="end">
          <IonButton onClick={() => setShowModal(true)}>
            <IonIcon slot="icon-only" icon={add} />
          </IonButton>
        </IonButtons>
      </TopNav>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        {showModal ? (
          <CreateListing onCancel={() => setShowModal(false)}></CreateListing>
        ) : null}

        <Container>
          <Listings loading={loading} error={error} data={data} />
        </Container>
      </IonContent>
    </IonPage>
  );
};

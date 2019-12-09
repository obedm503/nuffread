import { useApolloClient } from '@apollo/react-hooks';
import { IonItemOption, IonItemOptions, IonItemSliding } from '@ionic/react';
import ApolloClient, { MutationUpdaterFn } from 'apollo-client';
import gql from 'graphql-tag';
import React, { NamedExoticComponent } from 'react';
import { ListingBasic } from '../../../components/listing-basic';
import { MY_LISTINGS } from '../../../queries';
import {
  IListing,
  IMutation,
  IMutationDeleteListingArgs,
  IQuery,
} from '../../../schema.gql';
import { useMutation } from '../../../state/apollo';

const DELETE_LISTING = gql`
  mutation DeleteListing($id: ID!) {
    deleteListing(id: $id)
  }
`;

const update: (
  id: string,
  client: ApolloClient<object>,
) => MutationUpdaterFn<IMutation> = (id, client) => (cache, { data }) => {
  const success = data?.deleteListing;
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
  const [mutate, { loading, error }] = useMutation<IMutationDeleteListingArgs>(
    DELETE_LISTING,
  );
  const client = useApolloClient();

  if (error) {
    throw error;
  }

  return {
    del: () => mutate({ variables: { id }, update: update(id, client) }),
    loading,
  };
};

type Props = { listing: IListing };
export const SlidingListing = React.memo<Props>(function SlidingListing({
  listing,
}) {
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
}) as NamedExoticComponent<Props> & { loading };
SlidingListing.loading = ListingBasic.loading;

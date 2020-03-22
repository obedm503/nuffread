import { useApolloClient } from '@apollo/react-hooks';
import { AlertButton, IonAlert } from '@ionic/react';
import ApolloClient, { MutationUpdaterFn } from 'apollo-client';
import gql from 'graphql-tag';
import React, { useCallback } from 'react';
import { MY_LISTINGS } from '../../../queries';
import {
  IListing,
  IMutation,
  IMutationDeleteListingArgs,
  IQuery,
} from '../../../schema.gql';
import { readQuery, useMutation } from '../../../state';

const update: (
  id: string,
  client: ApolloClient<object>,
) => MutationUpdaterFn<IMutation> = (id, client) => (cache, { data }) => {
  const success = data?.deleteListing;
  if (!success) {
    return;
  }
  const listingsData = readQuery<IQuery>(client, { query: MY_LISTINGS });
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

const DELETE_LISTING = gql`
  mutation DeleteListing($id: ID!) {
    deleteListing(id: $id)
  }
`;

const useDelete = (id: string) => {
  const [mutate, { loading, error }] = useMutation<IMutationDeleteListingArgs>(
    DELETE_LISTING,
  );
  const client = useApolloClient();

  if (error) {
    throw error;
  }

  return {
    del: useCallback(() => {
      return mutate({ variables: { id }, update: update(id, client) });
    }, [client, id, mutate]),
    loading,
  };
};

export const useDeleteModal = () => {
  const [listing, setListing] = React.useState<IListing | undefined>(undefined);
  const open = React.useCallback(
    (listing: IListing) => setListing(listing),
    [],
  );
  const handleClose = React.useCallback(() => setListing(undefined), []);
  return { open, handleClose, listing };
};

export const DeleteModal = React.memo<{
  handleClose: () => void;
  listing: IListing;
}>(function DeleteModal({ listing, handleClose }) {
  const { del } = useDelete(listing.id);
  const buttons = React.useMemo<AlertButton[]>(() => {
    return [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
      },
      {
        text: 'Ok',
        handler: () => {
          del().then(() => handleClose());
        },
      },
    ];
  }, [del, handleClose]);

  return (
    <IonAlert
      isOpen
      onDidDismiss={handleClose}
      header="Delete Post"
      message="Are you sure you want to delete this post?"
      buttons={buttons}
    />
  );
});

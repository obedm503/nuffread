import { AlertButton, AlertInput, IonAlert } from '@ionic/react';
import gql from 'graphql-tag';
import React from 'react';
import { BASIC_LISTING } from '../../../queries';
import { IListing, IMutationSellListingArgs } from '../../../schema.gql';
import { useMutation } from '../../../state/apollo';

export const useSellModal = () => {
  const [listing, setListing] = React.useState<IListing | undefined>(undefined);
  const open = React.useCallback(
    (listing: IListing) => setListing(listing),
    [],
  );
  const handleClose = React.useCallback(() => setListing(undefined), []);
  return { open, handleClose, listing };
};

const SELL_LISTING = gql`
  ${BASIC_LISTING}

  mutation SellListing($listingId: ID!, $price: Int!) {
    sellListing(listingId: $listingId, price: $price) {
      ...BasicListing
    }
  }
`;

const useSell = () => {
  const [mutate, { error, loading }] = useMutation<IMutationSellListingArgs>(
    SELL_LISTING,
  );

  if (error) {
    throw error;
  }

  return {
    loading,
    sell: React.useCallback(
      ({ id, price }: { id: string; price: number }) => {
        return mutate({ variables: { listingId: id, price } });
      },
      [mutate],
    ),
  };
};

export const SellModal = React.memo<{
  handleClose: () => void;
  listing: IListing;
}>(function SellModal({ listing, handleClose }) {
  const { loading, sell } = useSell();
  const inputs = React.useMemo<AlertInput[]>(
    () => [
      {
        name: 'price',
        type: 'number',
        placeholder: (listing.price / 100).toString(),
        disabled: loading,
        min: 0,
      },
    ],
    [loading, listing],
  );
  const buttons = React.useMemo<AlertButton[]>(() => {
    return [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: values => {
          handleClose();
        },
      },
      {
        text: 'Ok',
        handler: values => {
          const price = parseFloat(values.price);
          if (Number.isNaN(price) || price <= 0) {
            return false;
          }
          sell({
            id: listing.id,
            price: price * 100,
          }).then(() => handleClose());
        },
      },
    ];
  }, [sell, handleClose, listing.id]);

  return (
    <IonAlert
      isOpen
      onDidDismiss={handleClose}
      header="Selling Price"
      message="What was the final selling price?"
      inputs={inputs}
      buttons={buttons}
    />
  );
});

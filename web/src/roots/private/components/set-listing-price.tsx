import { AlertButton, AlertInput, IonAlert } from '@ionic/react';
import { gql } from '@apollo/client';
import React from 'react';
import { BASIC_LISTING } from '../../../queries';
import { IListing, IMutationSetPriceArgs } from '../../../schema.gql';
import { useMutation } from '../../../state';

export const useSetPriceModal = () => {
  const [listing, setListing] = React.useState<IListing | undefined>(undefined);
  const open = React.useCallback(
    (listing: IListing) => setListing(listing),
    [],
  );
  const handleClose = React.useCallback(() => setListing(undefined), []);
  return { open, handleClose, listing };
};

const SET_PRICE = gql`
  ${BASIC_LISTING}

  mutation SetPrice($listingId: ID!, $price: Int!) {
    setPrice(listingId: $listingId, price: $price) {
      ...BasicListing
    }
  }
`;

const useSetPrice = () => {
  const [mutate, { error, loading }] = useMutation<IMutationSetPriceArgs>(
    SET_PRICE,
  );

  if (error) {
    throw error;
  }

  return {
    loading,
    setPrice: React.useCallback(
      ({ id, price }: { id: string; price: number }) => {
        return mutate({ variables: { listingId: id, price } });
      },
      [mutate],
    ),
  };
};

export const SetPriceModal = React.memo<{
  handleClose: () => void;
  listing: IListing;
}>(function SetPriceModal({ listing, handleClose }) {
  const { loading, setPrice } = useSetPrice();
  const inputs = React.useMemo<AlertInput[]>(
    () => [
      {
        name: 'price',
        type: 'number',
        value: (listing.price / 100).toString(),
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
          setPrice({
            id: listing.id,
            price: price * 100,
          }).then(() => handleClose());
        },
      },
    ];
  }, [setPrice, handleClose, listing.id]);

  return (
    <IonAlert
      isOpen
      onDidDismiss={handleClose}
      header="Change Price"
      inputs={inputs}
      buttons={buttons}
    />
  );
});

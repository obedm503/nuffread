import { useApolloClient } from '@apollo/react-hooks';
import { IonButton, IonIcon, IonToast } from '@ionic/react';
import gql from 'graphql-tag';
import { cart, cartOutline } from 'ionicons/icons';
import React from 'react';
import { BASIC_LISTING, SAVED_LISTINGS } from '../queries';
import {
  IListing,
  IMutationSaveListingArgs,
  IPaginationInput,
  IQuery,
} from '../schema.gql';
import { readQuery, tracker, useMutation } from '../state';

const SAVE_LISTING = gql`
  ${BASIC_LISTING}

  mutation SaveListing($listingId: ID!, $saved: Boolean!) {
    saveListing(listingId: $listingId, saved: $saved) {
      ...BasicListing
    }
  }
`;

export const SaveListingButton = React.memo<{
  listing: IListing;
}>(function SaveListingButton({ listing }) {
  const [isOpen, setShowToast] = React.useState(false);
  const hide = React.useCallback(() => setShowToast(false), [setShowToast]);

  const client = useApolloClient();

  const [save, { loading }] = useMutation<IMutationSaveListingArgs>(
    SAVE_LISTING,
  );

  const onClick = React.useCallback(
    async (e: React.MouseEvent<HTMLIonButtonElement, MouseEvent>) => {
      e.stopPropagation();

      const { data } = await save({
        variables: { listingId: listing.id, saved: !listing.saved },
        optimisticResponse: {
          __typename: 'Mutation',
          saveListing: { ...listing, saved: !listing.saved },
        } as any,
      });
      setShowToast(true);

      const updatedListing = data?.saveListing;
      if (!updatedListing) {
        return;
      }

      if (updatedListing.saved) {
        tracker.event('SAVE_POST', { listingId: updatedListing.id });
      } else {
        tracker.event('UNSAVE_POST', { listingId: updatedListing.id });
      }

      const listingsData = readQuery<IQuery, IPaginationInput>(client, {
        query: SAVED_LISTINGS,
        variables: { offset: 0 },
      });

      if (
        !(listingsData?.me?.__typename === 'User') ||
        !listingsData?.me?.saved
      ) {
        return;
      }

      let totalCount = listingsData.me.saved.totalCount;
      let listings = listingsData.me.saved.items;
      if (updatedListing.saved) {
        listings = [updatedListing, ...listings];
        totalCount += 1;
      } else {
        listings = listings.filter(item => item.id !== updatedListing.id);
        totalCount -= 1;
      }

      client.writeQuery({
        query: SAVED_LISTINGS,
        data: {
          ...listingsData,
          me: {
            ...listingsData.me,
            saved: {
              ...listingsData.me.saved,
              totalCount,
              items: listings,
            },
          },
        },
        variables: { offset: 0 },
      });
    },
    [save, listing, client],
  );

  if (typeof listing.saved !== 'boolean') {
    return null;
  }

  return (
    <IonButton onClick={onClick} color="white" fill="clear">
      <IonIcon
        slot="icon-only"
        color={loading ? 'medium' : 'dark'}
        icon={listing.saved ? cart : cartOutline}
        size="large"
      />

      <IonToast
        color="primary"
        isOpen={isOpen}
        onDidDismiss={hide}
        message={listing.saved ? 'Saved to Cart' : 'Removed from Cart'}
        duration={900}
      />
    </IonButton>
  );
});

import { useIonViewDidEnter } from '@ionic/react';
import { GET_LISTING } from '../queries';
import { IQueryListingArgs } from '../schema.gql';
import { queryLoading } from '../util';
import { useLazyQuery } from './apollo';

export const useListing = ({ listingId }) => {
  const [load, { loading, error, data, called }] = useLazyQuery<
    IQueryListingArgs
  >(GET_LISTING, {
    variables: { id: listingId },
  });
  const isLoading = queryLoading({ called, loading });
  useIonViewDidEnter(load);

  if (error) {
    throw error;
  }

  return {
    loading: isLoading,
    listing: (data && data.listing) || undefined,
  };
};

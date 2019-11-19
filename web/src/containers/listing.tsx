import { useIonViewDidEnter } from '@ionic/react';
import * as React from 'react';
import { Error } from '../components';
import { GET_LISTING } from '../queries';
import { IListing, IQueryListingArgs } from '../schema.gql';
import { useLazyQuery } from '../state/apollo';
import { queryLoading } from '../util';

export function withListing<T = undefined>(
  Component: React.FunctionComponent<
    {
      loading: boolean;
      data?: IListing;
    } & T
  >,
): React.FunctionComponent<{ id: string } & T> {
  const WithListing = React.memo<{ id } & T>(({ id, children, ...props }) => {
    const [load, { loading, error, data, called }] = useLazyQuery<
      IQueryListingArgs
    >(GET_LISTING, {
      variables: { id },
    });
    const isLoading = queryLoading({ called, loading });
    useIonViewDidEnter(load);

    if (error) {
      return <Error value={error} />;
    }
    return (
      <Component
        loading={isLoading}
        data={(data && data.listing) || undefined}
        {...(props as any)}
      />
    );
  });
  WithListing.displayName = `Memo(WithListing(${Component.displayName ||
    Component.name}))`;
  return WithListing;
}

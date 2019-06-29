import * as React from 'react';
import { Query } from 'react-apollo';
import { IQuery, IListing } from '../schema.gql';
import { GET_LISTING } from '../queries';
import { Error } from '../components';

export const withListing = (
  children: React.FunctionComponent<{ loading: boolean; data?: IListing }>,
): React.FunctionComponent<{ id: string }> => ({ id }) => (
  <Query<IQuery> query={GET_LISTING} variables={{ id }}>
    {({ loading, error, data }) => {
      if (error) {
        return <Error value={error} />;
      }
      return children({ loading, data: (data && data.listing) || undefined });
    }}
  </Query>
);

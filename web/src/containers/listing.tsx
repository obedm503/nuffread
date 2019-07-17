import * as React from 'react';
import { Query } from 'react-apollo';
import { IQuery, IListing } from '../schema.gql';
import { GET_LISTING } from '../queries';
import { Error } from '../components';

export function withListing<T = undefined>(
  component: React.FunctionComponent<{
    loading: boolean;
    data?: IListing;
    props: T;
  }>,
): React.FunctionComponent<{ id: string; props: T }> {
  return ({ id, children, props = {} as T }) => {
    return (
      <Query<IQuery> query={GET_LISTING} variables={{ id }}>
        {({ loading, error, data }) => {
          if (error) {
            return <Error value={error} />;
          }
          return component({
            loading,
            data: (data && data.listing) || undefined,
            props,
          });
        }}
      </Query>
    );
  };
}

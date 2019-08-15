import * as React from 'react';
import { Query } from 'react-apollo';
import { IQuery, IListing } from '../schema.gql';
import { GET_LISTING } from '../queries';
import { Error } from '../components';

export function withListing<T = undefined>(
  Component: React.FunctionComponent<
    {
      loading: boolean;
      data?: IListing;
    } & T
  >,
): React.FunctionComponent<{ id: string } & T> {
  return ({ id, children, ...props }) => {
    return (
      <Query<IQuery> query={GET_LISTING} variables={{ id }}>
        {({ loading, error, data }) => {
          if (error) {
            return <Error value={error} />;
          }
          return (
            <Component
              loading={loading}
              data={(data && data.listing) || undefined}
              {...props as any}
            />
          );
        }}
      </Query>
    );
  };
}

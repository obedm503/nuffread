import gql from 'graphql-tag';
import * as React from 'react';
import { Query } from 'react-apollo';
import { Error } from '../../../components';
import { BASIC_LISTING } from '../../../queries';
import { IQuery } from '../../../schema.gql';
import { Listings } from './listings';

const TOP_LISTINGS = gql`
  ${BASIC_LISTING}

  query TopListings {
    top {
      ...BasicListing

      user {
        id
        name
      }
    }
  }
`;

export const TopListings: React.SFC<{
  onClick;
}> = ({ onClick }) => {
  return (
    <Query<IQuery> query={TOP_LISTINGS}>
      {({ error, data, loading }) => {
        if (error) {
          return <Error value={error} />;
        }
        return (
          <Listings
            loading={loading}
            onClick={onClick}
            listings={data && data.top}
            title="Top Listings"
          />
        );
      }}
    </Query>
  );
};

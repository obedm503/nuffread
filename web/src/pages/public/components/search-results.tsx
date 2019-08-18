import * as React from 'react';
import { Query } from 'react-apollo';
import { Error } from '../../../components';
import { SEARCH } from '../../../queries';
import { IQuery } from '../../../schema.gql';
import { Listings } from './listings';

export const SearchListings: React.SFC<{
  onClick;
  searchValue?: string;
}> = ({ onClick, searchValue }) => {
  if (!searchValue) {
    return null;
  }
  return (
    <Query<IQuery> query={SEARCH} variables={{ query: searchValue }}>
      {({ error, data, loading }) => {
        if (error) {
          return <Error value={error} />;
        }
        return (
          <Listings
            loading={loading}
            onClick={onClick}
            listings={data && data.search}
            title={'Results for: ' + searchValue}
          />
        );
      }}
    </Query>
  );
};

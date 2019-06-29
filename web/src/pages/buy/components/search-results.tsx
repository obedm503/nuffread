import * as React from 'react';
import { Query } from 'react-apollo';
import { Error } from '../../../components';
import { SEARCH } from '../../../queries';
import { IQuery } from '../../../schema.gql';
import { ListingPage } from './listing';
import { Listings } from './listings';

export const SearchResults: React.SFC<{
  onClick;
  onSearch: (searchValue: string) => void;
  searchValue: string;
}> = ({ onClick, searchValue, onSearch }) => {
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
            component={ListingPage}
            onSearch={onSearch}
            searchValue={searchValue}
          />
        );
      }}
    </Query>
  );
};

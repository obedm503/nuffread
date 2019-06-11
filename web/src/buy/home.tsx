import { IonList } from '@ionic/react';
import gql from 'graphql-tag';
import { resolve } from 'path';
import * as React from 'react';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Error } from '../components';
import { BASIC_LISTING, GET_LISTING, SEARCH } from '../queries';
import { IQuery } from '../schema.gql';
import { ListingDetails } from './components/listing-details';
import { Listings } from './components/listings';
import { UserDetails } from './components/user-details';

const Listing: React.SFC<{
  id: string;
  base: string;
}> = ({ id, base }) => (
  <Query<IQuery> query={GET_LISTING} variables={{ id }}>
    {({ loading, error, data }) => {
      if (loading) {
        return null;
      }

      if (error || !data) {
        return <Error value={error} />;
      }

      const listing = data.listing;
      if (!listing) {
        return null;
      }

      return (
        <IonList lines="none">
          <ListingDetails listing={listing} base={base} />
          <UserDetails listingId={listing.id} />
        </IonList>
      );
    }}
  </Query>
);

type ListingsProps = {
  listingId?: string;
  onClick;
  base: string;
  onSearch: (searchValue: string) => void;
};
const SearchResults: React.SFC<ListingsProps & { searchValue: string }> = ({
  listingId,
  onClick,
  searchValue,
  onSearch,
  base,
}) => {
  return (
    <Query<IQuery> query={SEARCH} variables={{ query: searchValue }}>
      {({ error, data }) => {
        if (error || !data || !Array.isArray(data.search)) {
          return <Error value={error} />;
        }

        return (
          <Listings
            id={listingId}
            onClick={onClick}
            base={base}
            listings={data.search}
            component={Listing}
            onSearch={onSearch}
            searchValue={searchValue}
          />
        );
      }}
    </Query>
  );
};

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

const TopListings: React.SFC<ListingsProps> = ({
  listingId,
  onClick,
  base,
  onSearch,
}) => (
  <Query<IQuery> query={TOP_LISTINGS}>
    {({ error, data }) => {
      if (error || !data || !data.top) {
        return <Error value={error} />;
      }
      return (
        <Listings
          id={listingId}
          onClick={onClick}
          base={base}
          listings={data.top}
          component={Listing}
          onSearch={onSearch}
        />
      );
    }}
  </Query>
);

const setParam = (params: string, searchQuery: string) => {
  const query = new URLSearchParams(params);
  query.set('query', searchQuery);
  return query.toString();
};

type SearchProps = RouteComponentProps<{ listingId?: string }>;
export class Home extends React.Component<
  SearchProps,
  { searchValue: string; search: URLSearchParams }
> {
  navigate = ({ base, searchValue }) => {
    this.props.history.push({
      pathname: base,
      search: searchValue
        ? setParam(this.props.location.search, searchValue)
        : undefined,
    });
  };
  onSearch = searchValue => {
    this.navigate({ base: this.props.match.url, searchValue });
  };

  onListingClick = listingId => {
    this.navigate({
      base: resolve(this.props.match.url, '..', listingId),
      searchValue: this.state.searchValue,
    });
  };

  static getDerivedStateFromProps({ history }: SearchProps) {
    const search = new URLSearchParams(history.location.search);
    return {
      searchValue: search.get('query') || '',
      search,
    };
  }

  state = { searchValue: '', search: new URLSearchParams() };

  render() {
    const {
      match: { params, url },
    } = this.props;

    return this.state.search.has('query') ? (
      <SearchResults
        onClick={this.onListingClick}
        listingId={params.listingId}
        searchValue={this.state.searchValue}
        onSearch={this.onSearch}
        base={url}
      />
    ) : (
      <TopListings
        onClick={this.onListingClick}
        listingId={params.listingId}
        base={url}
        onSearch={this.onSearch}
      />
    );
  }
}

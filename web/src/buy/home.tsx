import { IonContent, IonList } from '@ionic/react';
import gql from 'graphql-tag';
import { resolve } from 'path';
import * as React from 'react';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Error, Footer } from '../components';
import { SearchBar } from '../components/search-bar';
import { BASIC_LISTING, GET_LISTING, SEARCH } from '../queries';
import { IQuery } from '../schema.gql';
import { ListingDetails } from './components/listing-details';
import { ListingsMain } from './components/listings';
import { Nav } from './components/nav';
import { SellerDetails } from './components/seller-details';

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
        <IonList>
          <ListingDetails listing={listing} base={base} />
          <SellerDetails listingId={listing.id} />
        </IonList>
      );
    }}
  </Query>
);

type ListingsProps = {
  listingId?: string;
  onClick;
  base: string;
};
const SearchListings = ({
  listingId,
  onClick,
  searchValue,
  base,
}: ListingsProps & { searchValue: string }) => {
  return (
    <Query<IQuery> query={SEARCH} variables={{ query: searchValue }}>
      {({ error, data }) => {
        if (error || !data || !data.search) {
          return <Error value={error} />;
        }

        return (
          <ListingsMain
            id={listingId}
            onClick={onClick}
            base={base}
            listings={data.search}
            children={Listing}
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

      seller {
        id
        name
      }
    }
  }
`;

const TopListings = ({ listingId, onClick, base }: ListingsProps) => (
  <Query<IQuery> query={TOP_LISTINGS}>
    {({ error, data }) => {
      if (error || !data || !data.top) {
        return <Error value={error} />;
      }
      return (
        <ListingsMain
          id={listingId}
          onClick={onClick}
          base={base}
          listings={data.top}
          children={Listing}
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
  navigate = ({ base, search }) => {
    this.props.history.push({
      pathname: base,
      search: search ? setParam(this.props.location.search, search) : undefined,
    });
  };
  onSearch = search => {
    this.navigate({ base: this.props.match.url, search });
  };

  onListingClick = listingId => {
    this.navigate({
      base: resolve(this.props.match.url, '..', listingId),
      search: this.state.searchValue,
    });
  };

  static getDerivedStateFromProps({ location }: SearchProps) {
    const search = new URLSearchParams(location.search);
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

    return (
      <>
        <Nav>
          <SearchBar
            onSearch={this.onSearch}
            searchValue={this.state.searchValue}
          />
        </Nav>

        <IonContent>
          {this.state.search.has('query') ? (
            <SearchListings
              onClick={this.onListingClick}
              listingId={params.listingId}
              searchValue={this.state.searchValue}
              base={url}
            />
          ) : (
            <TopListings
              onClick={this.onListingClick}
              listingId={params.listingId}
              base={url}
            />
          )}
        </IonContent>

        <Footer />
      </>
    );
  }
}

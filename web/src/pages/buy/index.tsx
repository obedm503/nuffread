import {
  IonButtons,
  IonCol,
  IonGrid,
  IonIcon,
  IonList,
  IonRow,
  IonSlide,
  IonSlides,
} from '@ionic/react';
import gql from 'graphql-tag';
import { range } from 'lodash';
import { join } from 'path';
import * as React from 'react';
import { Query } from 'react-apollo';
import { Redirect, RouteComponentProps } from 'react-router';
import { Error, IonButtonLink } from '../../components';
import { Listing, LoadingListing } from '../../components/listing';
import { BASIC_LISTING, GET_LISTING, SEARCH } from '../../queries';
import { IQuery } from '../../schema.gql';
import { Listings } from './components/listings';
import { UserDetails } from './components/user-details';

const ListingComp: React.SFC<{
  id: string;
}> = ({ id }) => (
  <Query<IQuery> query={GET_LISTING} variables={{ id }}>
    {({ loading, error, data }) => {
      if (error) {
        return <Error value={error} />;
      }

      const listing = data && data.listing;

      return (
        <IonGrid>
          {loading || !listing ? (
            <IonRow>
              <IonCol>
                <IonList lines="none">
                  <LoadingListing />
                </IonList>
              </IonCol>
            </IonRow>
          ) : (
            <>
              <IonRow>
                <IonCol>
                  <IonList lines="none">
                    <Listing priceColor="success" listing={listing}>
                      <IonButtons>
                        <IonButtonLink href="#">
                          <IonIcon slot="icon-only" name="barcode" />
                        </IonButtonLink>
                      </IonButtons>
                    </Listing>
                    <UserDetails listingId={listing.id} />
                  </IonList>
                </IonCol>
              </IonRow>

              <IonRow>
                <IonCol>
                  <IonSlides pager>
                    {range(12).map(i => (
                      <IonSlide key={i}>
                        <img
                          style={{ width: '100%', height: 'auto' }}
                          src="/img/128x128.png"
                          alt=""
                        />
                      </IonSlide>
                    ))}
                  </IonSlides>
                </IonCol>
              </IonRow>
            </>
          )}
        </IonGrid>
      );
    }}
  </Query>
);

type ListingsProps = {
  onClick;
  onSearch: (searchValue: string) => void;
};
const SearchResults: React.SFC<ListingsProps & { searchValue: string }> = ({
  onClick,
  searchValue,
  onSearch,
}) => {
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
            component={ListingComp}
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

const TopListings: React.SFC<ListingsProps> = ({ onClick, onSearch }) => {
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
            component={ListingComp}
            onSearch={onSearch}
          />
        );
      }}
    </Query>
  );
};

const setParam = (params: string, searchQuery: string) => {
  const query = new URLSearchParams(params);
  query.set('query', searchQuery);
  return query.toString();
};

type SearchProps = RouteComponentProps;
export class Buy extends React.Component<
  SearchProps,
  { searchValue: string; search: URLSearchParams }
> {
  navigate = ({ pathname, searchValue }) => {
    const search = searchValue
      ? setParam(this.props.location.search, searchValue)
      : undefined;
    this.props.history.push({
      pathname,
      search,
    });
  };
  onSearch = searchValue => {
    this.navigate({ pathname: this.props.location.pathname, searchValue });
  };

  onListingClick = id => {
    this.navigate({
      pathname: join('/listings', id),
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
      location: { pathname },
    } = this.props;

    if (pathname === '/') {
      return <Redirect to="/listings" />;
    }

    return this.state.search.has('query') ? (
      <SearchResults
        onClick={this.onListingClick}
        searchValue={this.state.searchValue}
        onSearch={this.onSearch}
      />
    ) : (
      <TopListings onClick={this.onListingClick} onSearch={this.onSearch} />
    );
  }
}

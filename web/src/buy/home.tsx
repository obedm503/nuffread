import {
  IonButtons,
  IonCol,
  IonGrid,
  IonIcon,
  IonList,
  IonRow,
  IonSlides,
  IonSlide,
} from '@ionic/react';
import gql from 'graphql-tag';
import { join } from 'path';
import * as React from 'react';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Error, IonButtonLink } from '../components';
import { Listing } from '../components/listing';
import { BASIC_LISTING, GET_LISTING, SEARCH } from '../queries';
import { IQuery } from '../schema.gql';
import { Listings } from './components/listings';
import { UserDetails } from './components/user-details';
import { range } from 'lodash';

const ListingComp: React.SFC<{
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
        <>
          <IonGrid>
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
                <div style={{ width: '40%' }}>
                  <IonSlides pager>
                    {range(12).map(i => (
                      <IonSlide key={i}>
                        <img
                          style={{ width: '50%', height: 'auto' }}
                          src="/img/128x128.png"
                          alt=""
                        />
                      </IonSlide>
                    ))}
                  </IonSlides>
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </>
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
          component={ListingComp}
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
export class Buy extends React.Component<
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
      base: join('/listings', listingId),
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

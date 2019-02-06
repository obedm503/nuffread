import {
  Button,
  Column,
  Columns,
  Container,
  Control,
  Field,
  Hero,
  HeroBody,
  Input,
} from 'bloomer';
import { resolve } from 'path';
import * as React from 'react';
import { Query, QueryResult } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Error, Icon } from '../components';
import { GET_LISTING, SEARCH } from '../queries';
import { IsDesktop } from '../state/desktop';
import { Listing } from './components/listing';
import { ListingDetails } from './components/listing-details';
import { SellerDetails } from './components/seller-details';

type SearchBarProps = { onSearch: any; searchValue: string; isLarge: boolean };
const SearchBar: React.SFC<SearchBarProps> = ({
  onSearch,
  searchValue,
  isLarge: large,
}) => (
  <Hero
    isColor="light"
    isSize={large ? undefined : 'small'}
    isFullHeight={large}
  >
    <HeroBody style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
      <Container>
        <Field hasAddons style={{ width: '100%' }}>
          <Control hasIcons isExpanded>
            <Icon name="search" size="small" align="left" />
            <Input
              placeholder="Find your book"
              onChange={onSearch}
              value={searchValue}
            />
          </Control>
          <Control>
            <Button>Search</Button>
          </Control>
        </Field>
      </Container>
    </HeroBody>
  </Hero>
);

const Details: React.SFC<{
  id: string;
  base: string;
}> = ({ id, base }) => (
  <Query<GQL.IQuery> query={GET_LISTING} variables={{ id }}>
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
          <ListingDetails listing={listing} base={base} />
          <SellerDetails listingId={listing.id} />
        </>
      );
    }}
  </Query>
);

const Listings: React.SFC<{
  onClick;
  currentId?: string;
  listings: GQL.IListing[];
}> = ({ onClick, currentId, listings }) => (
  <>
    {listings.map((listing, i) => {
      if (!listing) {
        return null;
      }
      return (
        <Listing
          key={listing.id}
          isFirst={i === 0}
          isActive={currentId === listing.id}
          onClick={() => onClick(listing.id)}
          listing={listing}
        />
      );
    })}
  </>
);

class Main extends React.Component<{
  isDesktop: boolean;
  listingId?: string;
  onClick;
  searchValue: string;
  base: string;
}> {
  render() {
    const { isDesktop, listingId, onClick, searchValue, base } = this.props;
    return (
      <Query query={SEARCH} variables={{ query: searchValue }}>
        {({ error, data, loading }: QueryResult<GQL.IQuery>) => {
          if (loading) {
            return <p>Loading...</p>;
          }

          if (error || !data || !data.search) {
            return <Error value={error} />;
          }

          return (
            <Container className={listingId ? 'buy-main' : ''}>
              <Columns>
                {isDesktop || !listingId ? (
                  <Column className={listingId ? 'scrolls' : ''}>
                    <Listings
                      onClick={onClick}
                      currentId={listingId}
                      listings={data.search}
                    />
                  </Column>
                ) : null}

                {listingId ? (
                  <Column>
                    <Details id={listingId} base={base} />
                  </Column>
                ) : null}
              </Columns>
            </Container>
          );
        }}
      </Query>
    );
  }
}

const setParam = (params: string, searchQuery: string) => {
  const query = new URLSearchParams(params);
  query.set('query', searchQuery);
  return query.toString();
};

type SearchProps = RouteComponentProps<{ listingId?: string }>;
export class Home extends React.Component<
  SearchProps,
  { searchValue: string }
> {
  onSearch = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const search = setParam(this.props.location.search, target.value);
    this.props.history.push({ pathname: this.props.match.url, search });
  };

  onListingClick = listingId => {
    const search = setParam(this.props.location.search, this.state.searchValue);
    this.props.history.push({
      pathname: resolve(this.props.match.url, '..', listingId),
      search,
    });
  };

  static getDerivedStateFromProps({ location }: SearchProps) {
    const search = new URLSearchParams(location.search);
    return { searchValue: search.get('query') || '' };
  }

  state = { searchValue: '' };

  render() {
    const {
      match: { params, url },
    } = this.props;

    const search = new URLSearchParams(this.props.location.search);

    return (
      <>
        <SearchBar
          onSearch={this.onSearch}
          searchValue={this.state.searchValue}
          isLarge={!search.has('query')}
        />

        {search.has('query') ? (
          <IsDesktop>
            {({ isDesktop }) => (
              <Main
                onClick={this.onListingClick}
                isDesktop={isDesktop}
                listingId={params.listingId}
                searchValue={this.state.searchValue}
                base={url}
              />
            )}
          </IsDesktop>
        ) : null}
      </>
    );
  }
}

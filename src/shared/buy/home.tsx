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
import { range } from 'lodash';
import * as React from 'react';
import { Query, QueryResult } from 'react-apollo';
import { Redirect, RouteComponentProps } from 'react-router';
import { Error, Icon } from '../components';
import { SEARCH } from '../queries';
import { IsDesktop } from '../state/desktop';
import { ListingBasic } from './components/listing-basic';
import { ListingDetails } from './components/listing-details';
import { SellerDetails } from './components/seller-details';

type SearchProps = { onSearch: any; searchValue: string };
const SearchBar: React.SFC<SearchProps> = ({ onSearch, searchValue }) => (
  <Hero isColor="light" isSize="small">
    <HeroBody style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
      <Container>
        <Field hasAddons style={{ width: '100%' }}>
          <Control hasIcons isExpanded>
            <Icon name="search" size="small" align="left" />
            <Input
              placeholder="Find your book"
              onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
                onSearch(target['value'])
              }
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
  listings: GQL.IListing[];
}> = ({ id, listings }) => {
  const listing = listings.find(item => !!item && id === item.id);
  if (!listing) {
    return null;
  }

  return (
    <>
      <ListingDetails {...listing} />
      <SellerDetails {...listing as any} />
    </>
  );
};

export const Listings: React.SFC<{
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
        <ListingBasic
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
}> {
  render() {
    const { isDesktop, listingId, onClick, searchValue } = this.props;
    return (
      <Query query={SEARCH} variables={{ query: searchValue }}>
        {({ error, data, loading }: QueryResult<GQL.IQuery>) => {
          if (loading) {
            return <p>Loading...</p>;
          }

          if (error || !data || !data.search) {
            return <Error value={error} />;
          }

          if (isDesktop && !listingId) {
            // redirect to first
            return <Redirect to={`/${data.search[0].id}`} />;
          }

          return (
            <Container className="buy-main">
              <Columns>
                {isDesktop || !listingId ? (
                  <Column className="scrolls">
                    <Listings
                      onClick={onClick}
                      currentId={listingId}
                      listings={data.search}
                    />
                  </Column>
                ) : null}

                {listingId ? (
                  <Column>
                    <Details id={listingId} listings={data.search} />
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

export class Home extends React.Component<
  RouteComponentProps<{ listingId?: string }>
> {
  onSearch = searchValue => this.setState({ searchValue });
  state = { searchValue: '' };

  render() {
    const {
      match: { params },
      history,
    } = this.props;
    return (
      <>
        <SearchBar
          onSearch={this.onSearch}
          searchValue={this.state.searchValue}
        />

        <IsDesktop>
          {({ isDesktop }) => (
            <Main
              onClick={listingId => history.push(`/${listingId}`)}
              isDesktop={isDesktop}
              listingId={params.listingId}
              searchValue={this.state.searchValue}
            />
          )}
        </IsDesktop>
      </>
    );
  }
}

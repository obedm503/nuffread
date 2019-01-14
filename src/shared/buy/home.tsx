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
import { Redirect, RouteComponentProps } from 'react-router';
import { Icon } from '../components';
import { IsDesktop } from '../state/desktop';
import { ListingBasic } from './components/listing-basic';
import { ListingDetails } from './components/listing-details';
import { SellerDetails } from './components/seller-details';

const SearchBar = () => (
  <Hero isColor="light" isSize="small">
    <HeroBody style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
      <Container>
        <Field hasAddons style={{ width: '100%' }}>
          <Control hasIcons isExpanded>
            <Icon name="search" size="small" align="left" />
            <Input placeholder="Find your book" />
          </Control>
          <Control>
            <Button>Search</Button>
          </Control>
        </Field>
      </Container>
    </HeroBody>
  </Hero>
);

const items = range(20).map(i => ({
  listingId: i.toString(),
  price: (i + 10 + i * 0.9).toFixed(2),
}));

const Details: React.SFC<{
  id: string;
  listings: Array<{ listingId: string; price: string }>;
}> = ({ id, listings }) => {
  const listing = listings.find(item => id === item.listingId);
  if (!listing) {
    return null;
  }

  return (
    <>
      <ListingDetails {...listing} />
      <SellerDetails {...listing} />
    </>
  );
};

export const Home: React.SFC<RouteComponentProps<{ listingId?: string }>> = ({
  match: { params },
  history,
}) => (
  <IsDesktop>
    {({ isDesktop }) => {
      if (isDesktop && !params.listingId) {
        // redirect to first
        return <Redirect to={`/${items[0].listingId}`} />;
      }
      return (
        <>
          <SearchBar />

          <Container className="buy-main">
            <Columns>
              {isDesktop || !params.listingId ? (
                <Column className="scrolls">
                  {items.map(({ listingId, price }, i) => (
                    <ListingBasic
                      key={listingId}
                      isActive={params.listingId === listingId}
                      onClick={() => history.push(`/${listingId}`)}
                      isFirst={i === 0}
                      price={price}
                    />
                  ))}
                </Column>
              ) : null}

              {params.listingId ? (
                <Column>
                  <Details id={params.listingId} listings={items} />
                </Column>
              ) : null}
            </Columns>
          </Container>
        </>
      );
    }}
  </IsDesktop>
);

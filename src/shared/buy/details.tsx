import { Column, Columns, Container, Image } from 'bloomer';
import { range } from 'lodash';
import * as React from 'react';
import { Query, QueryResult } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Error } from '../components';
import { SEARCH } from '../queries';
import { ListingDetails } from './components/listing-details';
import { SellerDetails } from './components/seller-details';

export const Details: React.SFC<RouteComponentProps<{ listingId: string }>> = ({
  match: {
    params: { listingId },
  },
}) => (
  <Query query={SEARCH}>
    {({ error, data, loading }: QueryResult<GQL.IQuery>) => {
      if (error) {
        return <Error value={error} />;
      }
      if (loading || !data || !data.search) {
        return <Container>Loading</Container>;
      }

      const listing = data.search.find(b => b.id === listingId);

      if (!listing) {
        return <Container>Loading</Container>;
      }

      return (
        <>
          <Container>
            <Columns>
              <Column className="scrolls">
                <ListingDetails {...listing} />
              </Column>

              <Column>
                <SellerDetails listingId={listingId} />
              </Column>
            </Columns>

            <Columns isMultiline>
              {range(12).map(i => (
                <Column isSize="narrow" key={i}>
                  <Image isSize="96x96" src="/img/128x128.png" />
                </Column>
              ))}
            </Columns>
          </Container>
        </>
      );
    }}
  </Query>
);

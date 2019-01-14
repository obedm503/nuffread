import { Column, Columns, Container, Image } from 'bloomer';
import { range } from 'lodash';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { ListingDetails } from './components/listing-details';
import { SellerDetails } from './components/seller-details';

export const Details: React.SFC<RouteComponentProps<{ listingId: string }>> = ({
  match: {
    params: { listingId },
  },
}) => (
  <>
    <Container>
      <Columns>
        <Column className="scrolls">
          <ListingDetails listingId={listingId} price={'10'} />
        </Column>

        <Column>
          <SellerDetails listingId={listingId} price={'10'} />
        </Column>
      </Columns>

      <Columns isMultiline>
        {range(12).map(i => (
          <Column isSize="narrow" key={i}>
            <Image isSize="96x96" src="/public/128x128.png" />
          </Column>
        ))}
      </Columns>
    </Container>
  </>
);

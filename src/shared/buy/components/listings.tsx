import { Column, Columns, Container } from 'bloomer';
import * as React from 'react';
import { Query } from 'react-apollo';
import { Error } from '../../components';
import { GET_LISTING } from '../../queries';
import { Listing } from './listing';
import { ListingDetails } from './listing-details';
import { SellerDetails } from './seller-details';

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

export class ListingsMain extends React.PureComponent<{
  listingId?: string;
  isDesktop: boolean;
  onClick: any;
  listings: GQL.IListing[];
  base: string;
}> {
  onClick = id => () => this.props.onClick(id);
  render() {
    const { listingId, isDesktop, listings, base } = this.props;
    return (
      <Container className={listingId ? 'buy-main' : ''}>
        <Columns>
          {isDesktop || !listingId ? (
            <Column className={listingId ? 'scrolls' : ''}>
              {listings.map((listing, i) => {
                if (!listing) {
                  return null;
                }
                return (
                  <Listing
                    key={listing.id}
                    isFirst={i === 0}
                    isActive={listingId === listing.id}
                    onClick={this.onClick(listing.id)}
                    listing={listing}
                  />
                );
              })}
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
  }
}

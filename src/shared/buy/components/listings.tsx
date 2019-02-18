import { Column, Columns, Container } from 'bloomer';
import * as React from 'react';
import { Listing } from './listing';

export class ListingsMain extends React.PureComponent<{
  id?: string;
  isDesktop: boolean;
  onClick: any;
  listings: Array<GQL.IListing | GQL.IBook>;
  base: string;
  children: (props: { id: string; base: string }) => React.ReactNode;
}> {
  onClick = id => () => this.props.onClick(id);
  render() {
    const { id, isDesktop, listings, base, children } = this.props;
    const Details = children as Function;
    return (
      <Container className={id ? 'buy-main' : ''}>
        <Columns>
          {isDesktop || !id ? (
            <Column className={id ? 'scrolls' : ''}>
              {listings.map((listing, i) => {
                if (!listing) {
                  return null;
                }
                return (
                  <Listing
                    key={listing.id}
                    isFirst={i === 0}
                    isActive={id === listing.id}
                    onClick={this.onClick(listing.id)}
                    listing={listing}
                  />
                );
              })}
            </Column>
          ) : null}

          {id ? (
            <Column style={{ width: '50%' }}>
              <Details id={id} base={base} />
            </Column>
          ) : null}
        </Columns>
      </Container>
    );
  }
}

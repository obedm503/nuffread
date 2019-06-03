import { IonList } from '@ionic/react';
import * as React from 'react';
import { Listing } from '../../components/listing';
import { IBook, IListing } from '../../schema.gql';
import { IsDesktop } from '../../state/desktop';

export class Listings extends React.PureComponent<{
  id?: string;
  onClick: any;
  listings: Array<IListing | IBook>;
  base: string;
  children: (props: { id: string; base: string }) => React.ReactNode;
}> {
  onClick = id => () => this.props.onClick(id);
  render() {
    const { id, listings, base, children } = this.props;
    const Details = children as Function;
    return (
      <IsDesktop>
        {({ isDesktop }) => (
          <div id="results-container">
            {isDesktop || !id ? (
              <div className={id ? 'half' : ''}>
                <IonList>
                  {listings.map((listing, i) => {
                    if (!listing) {
                      return null;
                    }
                    return (
                      <Listing
                        key={listing.id}
                        priceColor={i === 0 ? 'success' : undefined}
                        onClick={this.onClick(listing.id)}
                        listing={listing}
                      />
                    );
                  })}
                </IonList>
              </div>
            ) : null}

            {id ? (
              <div>
                <Details id={id} base={base} />
              </div>
            ) : null}
          </div>
        )}
      </IsDesktop>
    );
  }
}

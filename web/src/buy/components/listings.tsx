import { IonCol, IonContent, IonGrid, IonList, IonRow } from '@ionic/react';
import * as React from 'react';
import { IBook, IListing } from '../../../../schema.gql';
import { Listing } from '../../components/listing';

export class ListingsMain extends React.PureComponent<{
  id?: string;
  isDesktop: boolean;
  onClick: any;
  listings: Array<IListing | IBook>;
  base: string;
  children: (props: { id: string; base: string }) => React.ReactNode;
}> {
  onClick = id => () => this.props.onClick(id);
  render() {
    const { id, isDesktop, listings, base, children } = this.props;
    const Details = children as Function;
    return (
      <IonGrid style={{ width: '100%' }}>
        <IonRow>
          {isDesktop || !id ? (
            <IonCol>
              <IonContent style={{ height: 'calc(100vh - 11.99rem)' }}>
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
              </IonContent>
            </IonCol>
          ) : null}

          {id ? (
            <IonCol style={{ width: '50%' }}>
              <Details id={id} base={base} />
            </IonCol>
          ) : null}
        </IonRow>
      </IonGrid>
    );
  }
}

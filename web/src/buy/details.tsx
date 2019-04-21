import { IonCol, IonImg, IonRow } from '@ionic/react';
import { range } from 'lodash';
import * as React from 'react';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { IQuery } from '../../../schema.gql';
import { Error } from '../components';
import { Listing } from '../components/listing';
import { SEARCH } from '../queries';
import { SellerDetails } from './components/seller-details';

export const Details: React.SFC<RouteComponentProps<{ listingId: string }>> = ({
  match: {
    params: { listingId },
  },
}) => (
  <Query<IQuery> query={SEARCH}>
    {({ error, data, loading }) => {
      if (error) {
        return <Error value={error} />;
      }
      if (loading || !data || !data.search) {
        return <section>Loading</section>;
      }

      const listing = data.search.find(b => b.id === listingId);

      if (!listing) {
        return <section>Loading</section>;
      }

      return (
        <>
          <section>
            <IonRow>
              <IonCol class="scrolls">
                <Listing
                  listing={listing}
                  priceColor="success"
                  priceSize="large"
                />
              </IonCol>

              <IonCol>
                <SellerDetails listingId={listingId} />
              </IonCol>
            </IonRow>

            <IonRow>
              {range(12).map(i => (
                <IonCol key={i}>
                  <IonImg src="/img/128x128.png" />
                </IonCol>
              ))}
            </IonRow>
          </section>
        </>
      );
    }}
  </Query>
);

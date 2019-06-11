import { IonCol, IonContent, IonGrid, IonImg, IonRow } from '@ionic/react';
import { range } from 'lodash';
import * as React from 'react';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Error, Footer } from '../components';
import { Listing } from '../components/listing';
import { SEARCH } from '../queries';
import { IQuery } from '../schema.gql';
import { Nav } from './components/nav';
import { UserDetails } from './components/user-details';

export const Details: React.SFC<RouteComponentProps<{ listingId: string }>> = ({
  match: {
    params: { listingId },
  },
}) => (
  <>
    <Nav alwaysBack />

    <IonContent>
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
            <IonGrid>
              <IonRow>
                <IonCol>
                  <Listing listing={listing} priceColor="success" />
                </IonCol>

                <IonCol>
                  <UserDetails listingId={listingId} />
                </IonCol>
              </IonRow>

              <IonRow>
                {range(12).map(i => (
                  <IonCol key={i}>
                    <IonImg src="/img/128x128.png" />
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          );
        }}
      </Query>
    </IonContent>

    <Footer />
  </>
);

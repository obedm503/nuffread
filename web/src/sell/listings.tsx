import {
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonRow,
} from '@ionic/react';
import gql from 'graphql-tag';
import * as React from 'react';
import { Query } from 'react-apollo';
import { Error, IonItemLink, TopNav } from '../components';
import { Listing } from '../components/listing';
import { Popover } from '../components/popover';
import { BASIC_LISTING } from '../queries';
import { IQuery } from '../schema.gql';

const MY_LISTINGS = gql`
  ${BASIC_LISTING}

  query GetMyListings {
    me {
      ... on Seller {
        id
        listings {
          ...BasicListing
        }
      }
    }
  }
`;

export const Listings: React.SFC = () => (
  <>
    <TopNav>
      <IonButtons slot="end">
        <Popover>
          <IonItemLink href="/new">
            <IonIcon slot="start" name="add" />
            New Listing
          </IonItemLink>
        </Popover>
      </IonButtons>
    </TopNav>

    <IonContent>
      <IonGrid>
        <IonRow>
          <Query<IQuery> query={MY_LISTINGS}>
            {({ loading, error, data }) => {
              if (loading) {
                return null;
              }
              if (
                error ||
                !data ||
                !data.me ||
                data.me.__typename !== 'Seller'
              ) {
                return <Error value={error} />;
              }

              if (!data.me.listings.length) {
                return <IonCol size="12">No listings posted</IonCol>;
              }

              return data.me.listings.map(listing => {
                return (
                  <IonCol size="12" key={listing.id}>
                    <Listing listing={listing} />
                  </IonCol>
                );
              });
            }}
          </Query>
        </IonRow>
      </IonGrid>
    </IonContent>
  </>
);

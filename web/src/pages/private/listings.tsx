import {
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonPage,
  IonRow,
} from '@ionic/react';
import gql from 'graphql-tag';
import { add } from 'ionicons/icons';
import * as React from 'react';
import { Query } from 'react-apollo';
import { Error, IonItemLink, TopNav } from '../../components';
import { BasicListing, BasicListingLoading } from '../../components/listing';
import { Popover } from '../../components/popover';
import { BASIC_LISTING } from '../../queries';
import { IQuery } from '../../schema.gql';

const MY_LISTINGS = gql`
  ${BASIC_LISTING}

  query GetMyListings {
    me {
      ... on User {
        id
        listings {
          ...BasicListing
        }
      }
    }
  }
`;

export const MyListings: React.FC = () => (
  <IonPage>
    <TopNav>
      <IonButtons slot="end">
        <Popover>
          <IonItemLink href="/new">
            <IonIcon slot="start" icon={add} />
            New Listing
          </IonItemLink>
        </Popover>
      </IonButtons>
    </TopNav>

    <IonContent>
      <IonGrid>
        <IonRow>
          <IonCol size="12" sizeLg="10" offsetLg="1">
            <Query<IQuery> query={MY_LISTINGS}>
              {({ loading, error, data }) => {
                if (loading) {
                  return <BasicListingLoading />;
                }
                if (
                  error ||
                  !data ||
                  !data.me ||
                  data.me.__typename !== 'User'
                ) {
                  return <Error value={error} />;
                }

                if (!data.me.listings.length) {
                  return <span>No listings posted</span>;
                }

                return (
                  <>
                    {data.me.listings.map(listing => {
                      return (
                        <BasicListing listing={listing} key={listing.id} />
                      );
                    })}
                  </>
                );
              }}
            </Query>
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  </IonPage>
);

import { RefresherEventDetail } from '@ionic/core';
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonModal,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRow,
} from '@ionic/react';
import gql from 'graphql-tag';
import { add } from 'ionicons/icons';
import * as React from 'react';
import { QueryResult, useQuery } from 'react-apollo';
import { Error, TopNav } from '../../components';
import { BasicListing, BasicListingLoading } from '../../components/listing';
import { BASIC_LISTING } from '../../queries';
import { IQuery } from '../../schema.gql';
import { New } from './new';

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

const Listings: React.FC<
  Pick<QueryResult<IQuery>, 'data' | 'error' | 'loading'>
> = ({ loading, error, data }) => {
  if (loading) {
    return <>{BasicListingLoading.list}</>;
  }
  if (error || !data || !data.me || data.me.__typename !== 'User') {
    return <Error value={error} />;
  }

  if (!data.me.listings.length) {
    return <span>No listings posted</span>;
  }

  return (
    <>
      {data.me.listings.map(listing => {
        return <BasicListing listing={listing} key={listing.id} />;
      })}
    </>
  );
};

const CreateListing = ({ show, onCancel }) => (
  <IonModal isOpen={show}>
    <New onCancel={onCancel} />
  </IonModal>
);

export const MyListings: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);
  const { loading, error, data, refetch } = useQuery<IQuery>(MY_LISTINGS);

  const onRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await refetch();
    event.detail.complete();
  };

  return (
    <IonPage>
      <TopNav>
        <IonButtons slot="end">
          <IonButton onClick={() => setShowModal(true)}>
            <IonIcon slot="icon-only" icon={add} />
          </IonButton>
        </IonButtons>
      </TopNav>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <CreateListing
          show={showModal}
          onCancel={() => setShowModal(false)}
        ></CreateListing>

        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeLg="10" offsetLg="1">
              <Listings loading={loading} error={error} data={data} />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

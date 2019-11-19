import { QueryResult } from '@apollo/react-common';
import { RefresherEventDetail } from '@ionic/core';
import {
  IonButtons,
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonViewDidEnter,
} from '@ionic/react';
import * as React from 'react';
import {
  Container,
  Error,
  LogoutItem,
  Popover,
  TopNav,
} from '../../components';
import { MY_LISTINGS } from '../../queries';
import { IQuery } from '../../schema.gql';
import { useLazyQuery } from '../../state/apollo';
import { useUser } from '../../state/user';
import { queryLoading } from '../../util';
import { UserInfo } from '../public/components/user-details';
import { SlidingListing } from './components/sliding-listing';

const Listings = React.memo<
  Pick<QueryResult<IQuery>, 'data' | 'error' | 'loading'>
>(function Listings({ loading, error, data }) {
  if (loading) {
    return <>{SlidingListing.loading}</>;
  }
  if (error || !data || !data.me || data.me.__typename !== 'User') {
    return <Error value={error} />;
  }

  if (!data.me.listings.length) {
    return <span>No listings posted</span>;
  }

  return (
    <>
      {data.me.listings.map(listing => (
        <SlidingListing key={listing.id} listing={listing}></SlidingListing>
      ))}
    </>
  );
});

export const Profile = React.memo(function Profile() {
  const user = useUser();
  const [load, { loading, error, data, refetch, called }] = useLazyQuery(
    MY_LISTINGS,
  );
  useIonViewDidEnter(load);

  const isLoading = queryLoading({ called, loading });
  const onRefresh = React.useCallback(
    async (event: CustomEvent<RefresherEventDetail>) => {
      await refetch();
      event.detail.complete();
    },
    [refetch],
  );

  if (!user || user.__typename !== 'User') {
    return null;
  }

  return (
    <IonPage>
      <TopNav homeHref="/explore">
        <IonButtons slot="end">
          <Popover>
            <LogoutItem />
          </Popover>
        </IonButtons>
      </TopNav>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <Container>
          <UserInfo user={user}></UserInfo>

          <Listings loading={isLoading} error={error} data={data} />
        </Container>
      </IonContent>
    </IonPage>
  );
});

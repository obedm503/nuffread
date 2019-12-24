import { QueryResult } from '@apollo/react-common';
import { RefresherEventDetail } from '@ionic/core';
import {
  IonButtons,
  IonContent,
  IonItem,
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonViewWillEnter,
} from '@ionic/react';
import * as React from 'react';
import {
  Container,
  Error,
  ListWrapper,
  LogoutItem,
  Popover,
  TopNav,
  UserDetailed,
} from '../../components';
import { MY_LISTINGS } from '../../queries';
import { IQuery } from '../../schema.gql';
import { useLazyQuery } from '../../state/apollo';
import { useUser } from '../../state/user';
import { queryLoading } from '../../util';
import { SlidingListing } from './components/sliding-listing';

const Listings = React.memo<
  Pick<QueryResult<IQuery>, 'data' | 'error' | 'loading'>
>(function Listings({ loading, error, data }) {
  if (loading) {
    return <ListWrapper title="My Books">{SlidingListing.loading}</ListWrapper>;
  }
  if (error || !(data?.me?.__typename === 'User')) {
    return <Error value={error} />;
  }

  if (!data.me.listings.length) {
    return (
      <ListWrapper title="My Books">
        <IonItem>
          <IonLabel className="ion-text-wrap">
            No books for sale. To add a book, click the button at the bottom of
            the screen.
          </IonLabel>
        </IonItem>
      </ListWrapper>
    );
  }

  return (
    <ListWrapper title="My Books">
      {data.me.listings.map(listing => (
        <SlidingListing key={listing.id} listing={listing} />
      ))}
    </ListWrapper>
  );
});

export const Profile = React.memo(function Profile() {
  const user = useUser();
  const [load, { loading, error, data, refetch, called }] = useLazyQuery(
    MY_LISTINGS,
  );
  useIonViewWillEnter(load);

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
      <TopNav homeHref="/explore" title={user.name || user.email}>
        <IonButtons slot="end">
          <Popover>
            <LogoutItem />
          </Popover>
        </IonButtons>
      </TopNav>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <Container>
          <UserDetailed user={user} />

          <Listings loading={isLoading} error={error} data={data} />
        </Container>
      </IonContent>
    </IonPage>
  );
});

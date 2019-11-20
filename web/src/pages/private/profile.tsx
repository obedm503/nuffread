import { QueryResult } from '@apollo/react-common';
import { RefresherEventDetail } from '@ionic/core';
import {
  IonButtons,
  IonContent,
  IonItem,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonViewDidEnter,
} from '@ionic/react';
import * as React from 'react';
import {
  Container,
  Error,
  ListWrapper,
  LogoutItem,
  Popover,
  TopNav,
  UserInfo,
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
    return <ListWrapper title="Books">{SlidingListing.loading}</ListWrapper>;
  }
  if (error || !data || !data.me || data.me.__typename !== 'User') {
    return <Error value={error} />;
  }

  if (!data.me.listings.length) {
    return (
      <ListWrapper title="Books">
        <IonItem>
          No books for sale. To add a book, click the button at the bottom of
          the screen.
        </IonItem>
      </ListWrapper>
    );
  }

  return (
    <ListWrapper title="Books">
      {data.me.listings.map(listing => (
        <SlidingListing key={listing.id} listing={listing}></SlidingListing>
      ))}
    </ListWrapper>
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
      <TopNav homeHref="/explore" title={user.name || user.email}>
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

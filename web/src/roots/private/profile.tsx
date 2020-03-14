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
import { join } from 'path';
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
import { useRouter } from '../../state/router';
import { useUser } from '../../state/user';
import { queryLoading } from '../../util';
import {
  SettingsButton,
  SettingsModal,
  useSettingsModal,
} from './components/settings';
import { SlidingListing } from './components/sliding-listing';

const Listings = React.memo<
  Pick<QueryResult<IQuery>, 'data' | 'error' | 'loading'>
>(function Listings({ loading, error, data }) {
  const { history } = useRouter();
  const onClick = React.useCallback(
    (id: string) => history.push(join('/p', id)),
    [history],
  );

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
        <SlidingListing key={listing.id} listing={listing} onClick={onClick} />
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

  const { isOpen, handleClose, handleOpen } = useSettingsModal();

  if (!user || user.__typename !== 'User') {
    return null;
  }

  return (
    <IonPage>
      <SettingsModal isOpen={isOpen} onClose={handleClose} />

      <TopNav homeHref={false} title="Account">
        <IonButtons slot="end">
          <Popover>
            <LogoutItem />
            <SettingsButton onClick={handleOpen} />
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

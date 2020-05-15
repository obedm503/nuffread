import { QueryResult } from '@apollo/react-common';
import { RefresherEventDetail } from '@ionic/core';
import {
  ActionSheetButton,
  IonActionSheet,
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  cashOutline,
  close,
  ellipsisHorizontal,
  ellipsisVertical,
  logoUsd,
  trashOutline,
} from 'ionicons/icons';
import { join } from 'path';
import * as React from 'react';
import {
  BookCard,
  Container,
  Error,
  ListingCard,
  ListWrapper,
  LogoutItem,
  Popover,
  RelativeDate,
  TopNav,
  UserBasic,
  UserDetailed,
} from '../../components';
import { MY_LISTINGS } from '../../queries';
import { IListing, IQuery } from '../../schema.gql';
import { useLazyQuery, useRouter, useUser } from '../../state';
import { queryLoading } from '../../util';
import { DeleteModal, useDeleteModal } from './components/delete-listing';
import { SellModal, useSellModal } from './components/sell-listing';
import {
  SetPriceModal,
  useSetPriceModal,
} from './components/set-listing-price';
import {
  SettingsButton,
  SettingsModal,
  useSettingsModal,
} from './components/settings';

const List = ({ children }) => (
  <ListWrapper title="My Books">{children}</ListWrapper>
);

const Listing: React.FC<{
  listing: IListing;
  onOptions: (state: OptionsState) => void;
  onClick: (id: string) => void;
}> = ({ listing, onOptions, onClick }) => {
  const me = useUser();
  const handleOptions = React.useCallback(
    (event: React.MouseEvent<HTMLIonButtonElement, MouseEvent>) => {
      event.stopPropagation();
      onOptions({ event: event.nativeEvent, listing });
    },
    [listing, onOptions],
  );

  if (!me || me.__typename === 'Admin') {
    return null;
  }

  return (
    <BookCard
      onClick={onClick}
      listing={listing}
      before={
        <UserBasic user={me}>
          <IonButton
            onClick={handleOptions}
            slot="end"
            fill="clear"
            color="dark"
            size="default"
          >
            <IonIcon
              slot="icon-only"
              md={ellipsisVertical}
              ios={ellipsisHorizontal}
            />
          </IonButton>
        </UserBasic>
      }
      after={
        <IonItem lines="none">
          <IonLabel>
            <small>
              <RelativeDate date={listing.createdAt} />
            </small>
          </IonLabel>
        </IonItem>
      }
    />
  );
};

type OptionsState = {
  listing?: IListing;
  event?: MouseEvent;
};
function useOptions() {
  const [{ event, listing }, setState] = React.useState<OptionsState>({});
  return {
    event,
    listing,
    open: React.useCallback((state) => setState(state), []),
    handleClose: React.useCallback(() => setState({}), []),
  };
}
const Options: React.FC<{
  options: { event?; listing?: IListing; handleClose: () => void };
  sell: (listing: IListing) => void;
  del: (listing: IListing) => void;
  setPrice: (listing: IListing) => void;
}> = ({ options, setPrice, sell, del }) => {
  const handleClose = options.handleClose;
  const onSetPrice = React.useCallback(() => {
    if (!options.listing) {
      return;
    }
    handleClose();
    setPrice(options.listing);
  }, [setPrice, handleClose, options]);

  const onSell = React.useCallback(() => {
    if (!options.listing) {
      return;
    }
    handleClose();
    sell(options.listing);
  }, [sell, handleClose, options]);

  const onDel = React.useCallback(() => {
    if (!options.listing) {
      return;
    }
    handleClose();
    del(options.listing);
  }, [del, handleClose, options]);

  const buttons = React.useMemo<ActionSheetButton[]>(() => {
    const buttons: ActionSheetButton[] = [];
    if (options.listing && !options.listing.soldAt) {
      buttons.push(
        {
          text: 'Change Price',
          icon: logoUsd,
          handler: onSetPrice,
        },
        {
          text: 'Sold',
          icon: cashOutline,
          handler: onSell,
        },
      );
    }
    buttons.push(
      {
        text: 'Delete',
        role: 'destructive',
        icon: trashOutline,
        handler: onDel,
      },
      {
        text: 'Cancel',
        role: 'cancel',
        icon: close,
      },
    );
    return buttons;
  }, [onSetPrice, onSell, onDel, options.listing]);

  if (!options.event) {
    return null;
  }

  return (
    <IonActionSheet
      isOpen
      onDidDismiss={options.handleClose}
      buttons={buttons}
    />
  );
};

const Listings = React.memo<
  Pick<QueryResult<IQuery>, 'data' | 'error' | 'loading'>
>(function Listings({ loading, error, data }) {
  const { history } = useRouter();
  const handleClick = React.useCallback(
    (id: string) => history.push(join('/p', id)),
    [history],
  );

  const options = useOptions();
  const sell = useSellModal();
  const del = useDeleteModal();
  const setPrice = useSetPriceModal();

  if (loading) {
    return <List>{ListingCard.loading}</List>;
  }
  if (error) {
    return <Error value={error} />;
  }
  if (!(data?.me?.__typename === 'User')) {
    return null;
  }

  if (!data.me.listings.length) {
    return (
      <List>
        <IonItem>
          <IonLabel className="ion-text-wrap">
            No books for sale. To add a book, click the button at the bottom of
            the screen.
          </IonLabel>
        </IonItem>
      </List>
    );
  }

  return (
    <>
      <Options
        options={options}
        sell={sell.open}
        del={del.open}
        setPrice={setPrice.open}
      />

      {setPrice.listing ? (
        <SetPriceModal
          listing={setPrice.listing}
          handleClose={setPrice.handleClose}
        />
      ) : null}

      {sell.listing ? (
        <SellModal listing={sell.listing} handleClose={sell.handleClose} />
      ) : null}

      {del.listing ? (
        <DeleteModal listing={del.listing} handleClose={del.handleClose} />
      ) : null}

      <List>
        {data.me.listings.map((listing) => (
          <Listing
            key={listing.id}
            listing={listing}
            onClick={handleClick}
            onOptions={options.open}
          />
        ))}
      </List>
    </>
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

  const settings = useSettingsModal();

  if (!user || user.__typename !== 'User') {
    return null;
  }

  return (
    <IonPage>
      <SettingsModal isOpen={settings.isOpen} onClose={settings.handleClose} />

      <TopNav homeHref={false} title="Account">
        <IonButtons slot="end">
          <Popover attached>
            <LogoutItem />
            <SettingsButton onClick={settings.handleOpen} />
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

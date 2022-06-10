import { gql, useApolloClient } from '@apollo/client';
import { SelectChangeEventDetail } from '@ionic/core';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToolbar,
} from '@ionic/react';
import { close, logoUsd } from 'ionicons/icons';
import React from 'react';
import { Error, Title } from '../../../components';
import { CREATE_LISTING, MY_LISTINGS } from '../../../queries';
import {
  IGoogleBook,
  IListingInput,
  IMutation,
  IQuery,
  IQueryGoogleBookArgs,
  ListingCondition,
} from '../../../schema.gql';
import { readQuery, tracker, useMutation, useQuery } from '../../../state';
import { conditionNames } from '../../../util';
import { CoverPicker } from './cover-picker';
import { PickBook } from './pick-book';
import { ListingState, PreviewListing } from './preview';

const GOOGLE_BOOK = gql`
  query GoogleBook($id: ID!) {
    googleBook(id: $id) {
      etag
      googleId
      authors
      isbn
      publishedAt
      title
      subTitle
      possibleCovers
    }
  }
`;

const onCompleted = ({ createListing }: IMutation) => {
  tracker.event('CREATE_LISTING', { price: createListing.price });
};
const useCreateListing = (listing: ListingState, closeModal) => {
  const client = useApolloClient();
  const [create, { loading, data, error }] = useMutation<IListingInput>(
    CREATE_LISTING,
    {
      variables: {
        googleId: listing.googleId,
        price: parseFloat(listing.price) * 100,
        description: listing.description,
        coverIndex: listing.coverIndex,
        condition: listing.condition,
      },
      onCompleted,
      update: (proxy, { data }) => {
        const newListing = data?.createListing;
        if (!newListing) {
          return;
        }

        // best effort update
        const listingsData = readQuery<IQuery>(client, { query: MY_LISTINGS });
        if (
          !(listingsData?.me?.__typename === 'User') ||
          !listingsData?.me?.listings
        ) {
          return;
        }
        const listings = listingsData.me.listings;
        client.writeQuery({
          query: MY_LISTINGS,
          data: {
            ...listingsData,
            me: {
              ...listingsData.me,
              listings: [newListing, ...listings],
            },
          },
        });
      },
    },
  );
  return {
    create: React.useCallback(async () => {
      await create();
      closeModal();
    }, [create, closeModal]),
    loading,
    error,
    listing: data?.createListing,
  };
};

const initialState = {
  searchValue: '',
  googleId: '',
  price: '',
  description: '',
  isFocused: false,
  book: {} as any,
  coverIndex: 0,
  condition: undefined as any,
};
const useListingState = () => {
  const [state, set] = React.useState<
    ListingState & {
      searchValue: string;
      isFocused: boolean;
    }
  >(initialState);

  const pickBook = React.useCallback(
    (book: IGoogleBook) =>
      set(state => ({
        ...state,
        googleId: book.googleId,
        isFocused: false,
        coverIndex: 0,
      })),
    [],
  );
  const setPrice = React.useCallback(({ detail }) => {
    if (detail.value) {
      set(state => ({ ...state, price: detail.value }));
    }
  }, []);

  return {
    state,
    pickBook: pickBook,
    onFocus: React.useCallback(
      () => set(state => ({ ...state, isFocused: true })),
      [],
    ),
    setPrice: setPrice,
    setDescription: React.useCallback(({ detail }) => {
      if (detail.value) {
        set(state => ({ ...state, description: detail.value }));
      }
    }, []),
    setCoverIndex: React.useCallback(
      index => set(state => ({ ...state, coverIndex: index })),
      [],
    ),
    setCondition: React.useCallback(
      (event: CustomEvent<SelectChangeEventDetail>) =>
        set(state => ({ ...state, condition: event.detail.value })),
      [],
    ),
  };
};

function ConditionOptions() {
  return (
    <>
      {(
        [
          ListingCondition.New,
          ListingCondition.LikeNew,
          ListingCondition.VeryGood,
          ListingCondition.Good,
          ListingCondition.Acceptable,
        ] as ListingCondition[]
      ).map(cond => (
        <IonSelectOption key={cond} value={cond}>
          {conditionNames[cond]}
        </IonSelectOption>
      ))}
    </>
  );
}

export function CreateModal({ isOpen, onClose: closeModal }) {
  const {
    state,
    pickBook,
    setDescription,
    setPrice,
    setCoverIndex,
    onFocus,
    setCondition,
  } = useListingState();
  const {
    create,
    loading: createLoading,
    error,
    listing,
  } = useCreateListing(state, closeModal);

  const onClick = React.useCallback(
    (e: React.MouseEvent | CustomEvent) => {
      e.stopPropagation();
      e.preventDefault();
      closeModal();
    },
    [closeModal],
  );

  const resBook = useQuery<IQueryGoogleBookArgs>(GOOGLE_BOOK, {
    variables: { id: state.googleId },
    skip: !state.googleId,
  });

  const loading = createLoading || resBook.loading;

  const googleBook = resBook.data?.googleBook;
  const possibleCovers = googleBook?.possibleCovers;

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClick}>
      <IonHeader>
        <IonToolbar color="white">
          <Title title="Post Book" homeHref={false} />

          <IonButtons slot="secondary">
            <IonButton onClick={onClick}>
              <IonIcon slot="icon-only" icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Pick a book</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <PickBook
              onClick={pickBook}
              activeId={state.googleId}
              onFocus={onFocus}
              isFocused={state.isFocused}
            />
          </IonCardContent>
        </IonCard>

        {googleBook &&
        Array.isArray(possibleCovers) &&
        possibleCovers.length > 1 ? (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Pick Cover Image</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <CoverPicker
                book={googleBook}
                possibleCovers={possibleCovers}
                coverIndex={state.coverIndex}
                setCoverIndex={setCoverIndex}
              />
            </IonCardContent>
          </IonCard>
        ) : null}

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Details</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <IonItem>
              <IonLabel>Book Condition</IonLabel>
              <IonSelect value={state.condition} onIonChange={setCondition}>
                <ConditionOptions />
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel>Price</IonLabel>
              <IonIcon icon={logoUsd} size="small" />
              <IonInput
                type="number"
                value={state.price}
                debounce={500}
                onIonChange={setPrice}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Description</IonLabel>
              <IonTextarea
                value={state.description}
                debounce={500}
                onIonChange={setDescription}
                maxlength={300}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* <IonCard>
            <IonCardHeader>
              <IonCardTitle>Upload pictures</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>upload pictures</IonCardContent>
          </IonCard> */}

        {googleBook ? (
          <PreviewListing
            {...state}
            book={googleBook}
            coverIndex={state.coverIndex}
            price={state.price}
            condition={state.condition}
          />
        ) : null}

        {error ? <Error value={error} /> : null}
      </IonContent>

      {!listing ? (
        <IonFooter>
          <IonButton
            className="ion-margin"
            expand="block"
            onClick={create}
            disabled={
              !state.googleId || !state.price || !state.condition || loading
            }
            size="default"
          >
            Post
          </IonButton>
        </IonFooter>
      ) : null}
    </IonModal>
  );
}

import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonIcon,
  IonItem,
  IonLabel,
  IonSkeletonText,
  IonToast,
} from '@ionic/react';
import gql from 'graphql-tag';
import range from 'lodash/range';
import React from 'react';
// TODO: using ionicons version 5 icons before release, update when v5 releases
import bookmarkOutline from '../icons/bookmark-outline.svg';
import bookmark from '../icons/bookmark.svg';
import { IListing, IMutationSaveListingArgs } from '../schema.gql';
import { useMutation } from '../state/apollo';
import { RelativeDate } from './relative-date';
import { SafeImg } from './safe-img';
import { UserBasic } from './user-details';

const SAVE_LISTING = gql`
  mutation SaveListing($listingId: ID!, $saved: Boolean!) {
    saveListing(listingId: $listingId, saved: $saved) {
      id
      saved
    }
  }
`;

const SaveListingButton = React.memo<{
  saved: IListing['saved'];
  listingId: IListing['id'];
}>(function SaveListingButton({ saved, listingId }) {
  const [isOpen, setShowToast] = React.useState(false);
  const hide = React.useCallback(() => setShowToast(false), [setShowToast]);

  const [save, { loading }] = useMutation<IMutationSaveListingArgs>(
    SAVE_LISTING,
  );
  const onClick = React.useCallback(
    async (e: React.MouseEvent<HTMLIonButtonElement, MouseEvent>) => {
      e.stopPropagation();
      await save({
        variables: { listingId, saved: !saved },
        optimisticResponse: {
          __typename: 'Mutation',
          saveListing: { __typename: 'Listing', id: listingId, saved: !saved },
        } as any,
      });
      setShowToast(true);
    },
    [save, saved, listingId],
  );

  if (typeof saved !== 'boolean') {
    return null;
  }

  return (
    <IonButtons slot="end">
      <IonButton onClick={onClick} color={loading ? 'medium' : 'dark'}>
        <IonIcon
          slot="icon-only"
          icon={saved ? bookmark : bookmarkOutline}
          size="large"
        />

        <IonToast
          color="primary"
          isOpen={isOpen}
          onDidDismiss={hide}
          message={saved ? 'Saved post.' : 'Unsaved post.'}
          duration={400}
        />
      </IonButton>
    </IonButtons>
  );
});

type BookCardProps = {
  onClick?;
  before?;
  detailed?: boolean;
  after?;
} & Pick<IListing, 'saved' | 'book' | 'description' | 'id' | 'price'>;
export const BookCard = React.memo<BookCardProps>(function BookCard({
  onClick,
  before,
  book,
  detailed,
  description,
  after,
  price,
  saved,
  id,
}) {
  return (
    <IonCard
      color="white"
      className="book-card"
      onClick={onClick}
      button={!!onClick}
    >
      {before}

      <IonCardHeader>
        <IonCardTitle>
          {book.title}

          {price ? (
            <IonBadge color="secondary" style={badgeStyle}>
              ${price / 100}
            </IonBadge>
          ) : null}
        </IonCardTitle>

        {book.subTitle ? (
          <IonCardSubtitle>{book.subTitle}</IonCardSubtitle>
        ) : null}
      </IonCardHeader>

      <IonCardContent>
        <SafeImg
          src={book.thumbnail || undefined}
          alt={[book.title, book.subTitle].join(' ')}
          placeholder="/img/book.png"
          className="book-cover-card"
        />
      </IonCardContent>

      <IonItem lines="inset">
        <SaveListingButton saved={saved} listingId={id} />

        <IonLabel className="ion-text-wrap">
          <b>{book.authors.join(', ')}</b>
        </IonLabel>
      </IonItem>

      {description ? (
        <IonItem lines="inset">
          <IonLabel className="ion-text-wrap">{description}</IonLabel>
        </IonItem>
      ) : null}

      {detailed
        ? book.isbn.map(isbn => (
            <IonItem lines="inset" key={isbn}>
              <IonLabel>
                <small>
                  <b>ISBN: </b> {isbn}
                </small>
              </IonLabel>
            </IonItem>
          ))
        : null}

      {detailed && book.publishedAt ? (
        <IonItem lines="inset">
          <IonLabel>
            <small>
              <b>Published on: </b>
              {new Date(book.publishedAt).toLocaleDateString()}
            </small>
          </IonLabel>
        </IonItem>
      ) : null}

      {after}
    </IonCard>
  );
});

const badgeStyle = { fontSize: 'inherit', float: 'right' };
type Props = {
  onClick?;
  listing: IListing;
  detailed?: boolean;
};
export const ListingCard = React.memo<Props>(function ListingCard({
  onClick,
  listing,
  detailed = false,
}) {
  return (
    <BookCard
      onClick={onClick}
      id={listing.id}
      description={listing.description}
      book={listing.book}
      price={listing.price}
      saved={listing.saved}
      detailed={detailed}
      before={listing.user ? <UserBasic user={listing.user} /> : null}
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
}) as React.NamedExoticComponent<Props> & { loading };

export const LoadingListingCard = ({ animated = true }) => (
  <IonCard color="white" className="book-card">
    <IonCardHeader>
      <IonCardTitle>
        <IonSkeletonText animated={animated} style={{ width: '90%' }} />
      </IonCardTitle>

      <IonCardSubtitle>
        <IonSkeletonText animated={animated} style={{ width: '45%' }} />
      </IonCardSubtitle>
    </IonCardHeader>

    <IonCardContent>
      <IonSkeletonText
        slot="start"
        animated={animated}
        className="book-cover-card"
      />
    </IonCardContent>

    <IonItem lines="inset">
      <IonLabel>
        <IonSkeletonText animated={animated} style={{ width: '100%' }} />
      </IonLabel>
    </IonItem>
    <IonItem lines="none">
      <IonLabel>
        <small>
          <IonSkeletonText animated={animated} style={{ width: '40%' }} />
        </small>
      </IonLabel>
    </IonItem>
  </IonCard>
);

ListingCard.loading = range(10).map(n => (
  <LoadingListingCard key={n} animated />
));

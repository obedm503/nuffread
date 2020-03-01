import { useApolloClient } from '@apollo/react-hooks';
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
import { bookmark, bookmarkOutline, person } from 'ionicons/icons';
import range from 'lodash/range';
import React from 'react';
import { BASIC_LISTING, SAVED_LISTINGS } from '../queries';
import {
  IListing,
  IMutationSaveListingArgs,
  IPaginationInput,
  IQuery,
  ISchool,
} from '../schema.gql';
import { readQuery, useMutation } from '../state/apollo';
import { tracker } from '../state/tracker';
import { IListingPreview } from '../util.types';
import { RelativeDate } from './relative-date';
import { SafeImg } from './safe-img';
import { UserBasic } from './user-details';

const SAVE_LISTING = gql`
  ${BASIC_LISTING}

  mutation SaveListing($listingId: ID!, $saved: Boolean!) {
    saveListing(listingId: $listingId, saved: $saved) {
      ...BasicListing
    }
  }
`;

const SaveListingButton = React.memo<{
  listing: IListing;
}>(function SaveListingButton({ listing }) {
  const [isOpen, setShowToast] = React.useState(false);
  const hide = React.useCallback(() => setShowToast(false), [setShowToast]);

  const client = useApolloClient();

  const [save, { loading }] = useMutation<IMutationSaveListingArgs>(
    SAVE_LISTING,
  );

  const onClick = React.useCallback(
    async (e: React.MouseEvent<HTMLIonButtonElement, MouseEvent>) => {
      e.stopPropagation();
      const { data } = await save({
        variables: { listingId: listing.id, saved: !listing.saved },
        optimisticResponse: {
          __typename: 'Mutation',
          saveListing: { ...listing, saved: !listing.saved },
        } as any,
      });
      setShowToast(true);

      const updatedListing = data?.saveListing;
      if (!updatedListing) {
        return;
      }

      if (updatedListing.saved) {
        tracker.event('SAVE_POST', { listingId: updatedListing.id });
      } else {
        tracker.event('UNSAVE_POST', { listingId: updatedListing.id });
      }

      const listingsData = readQuery<IQuery, IPaginationInput>(client, {
        query: SAVED_LISTINGS,
        variables: { offset: 0 },
      });

      if (
        !(listingsData?.me?.__typename === 'User') ||
        !listingsData?.me?.saved
      ) {
        return;
      }

      let totalCount = listingsData.me.saved.totalCount;
      let listings = listingsData.me.saved.items;
      if (updatedListing.saved) {
        listings = [updatedListing, ...listings];
        totalCount += 1;
      } else {
        listings = listings.filter(item => item.id !== updatedListing.id);
        totalCount -= 1;
      }

      client.writeQuery({
        query: SAVED_LISTINGS,
        data: {
          ...listingsData,
          me: {
            ...listingsData.me,
            saved: {
              ...listingsData.me.saved,
              totalCount,
              items: listings,
            },
          },
        },
        variables: { offset: 0 },
      });
    },
    [save, listing, client],
  );

  if (typeof listing.saved !== 'boolean') {
    return null;
  }

  return (
    <IonButtons slot="end">
      <IonButton onClick={onClick} color={loading ? 'medium' : 'dark'}>
        <IonIcon
          slot="icon-only"
          icon={listing.saved ? bookmark : bookmarkOutline}
          size="large"
        />

        <IonToast
          color="primary"
          isOpen={isOpen}
          onDidDismiss={hide}
          message={listing.saved ? 'Saved post.' : 'Unsaved post.'}
          duration={400}
        />
      </IonButton>
    </IonButtons>
  );
});

type BookCardProps = {
  onClick?: (id: string) => void;
  before?;
  detailed?: boolean;
  after?;
  listing: IListing | IListingPreview;
};
export const BookCard = React.memo<BookCardProps>(function BookCard({
  onClick,
  before,
  detailed,
  after,
  listing,
}) {
  const handleClick = React.useCallback(() => {
    onClick && listing.__typename === 'Listing' && onClick(listing.id);
  }, [onClick, listing]);
  const { book, description, price } = listing;
  return (
    <IonCard
      color="white"
      className="book-card"
      onClick={handleClick}
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
        {listing.__typename === 'Listing' ? (
          <SaveListingButton listing={listing} />
        ) : null}

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

const SchoolItem = React.memo<{ school: ISchool }>(function SchoolItem({
  school,
}) {
  return (
    <IonItem lines="full">
      <IonIcon slot="start" color="dark" ios={person} md={person} />
      <IonLabel>{school.name}</IonLabel>
    </IonItem>
  );
});

const badgeStyle = { fontSize: 'inherit', float: 'right' };
type Props = {
  onClick?: (id: string) => void;
  listing: IListing | IListingPreview;
  detailed?: boolean;
  showUser?: boolean;
};
export const ListingCard = React.memo<Props>(function ListingCard({
  onClick,
  listing,
  detailed = false,
  showUser = true,
}) {
  return (
    <BookCard
      onClick={onClick}
      listing={listing}
      detailed={detailed}
      before={
        showUser &&
        (listing.__typename !== 'Listing' ? null : listing.user ? (
          <UserBasic user={listing.user} />
        ) : (
          <SchoolItem school={listing.school} />
        ))
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

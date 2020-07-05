import {
  IonBadge,
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
} from '@ionic/react';
import { person } from 'ionicons/icons';
import range from 'lodash/range';
import React from 'react';
import { IListing, ISchool } from '../schema.gql';
import { conditionNames } from '../util';
import { IListingPreview } from '../util.types';
import { GoToChat } from './go-to-chat';
import { RelativeDate } from './relative-date';
import { SafeImg } from './safe-img';
import { SaveListingButton } from './save-listing-button';
import { UserBasic } from './user-details';

const badgeStyle = {
  fontSize: 'inherit',
  display: 'inline-block',
  verticalAlign: 'text-bottom',
  marginRight: '1rem',
};
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
  const { book, description, condition } = listing;

  const sold = !!('soldPrice' in listing && listing.soldPrice);
  // @ts-ignore
  const price = sold ? listing.soldPrice : listing.price;

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
          {price ? (
            <IonBadge color={sold ? 'success' : 'danger'} style={badgeStyle}>
              ${price / 100}
            </IonBadge>
          ) : null}

          {book.title}
        </IonCardTitle>

        {book.subTitle ? (
          <IonCardSubtitle>{book.subTitle}</IonCardSubtitle>
        ) : null}
      </IonCardHeader>

      <IonCardContent>
        <div className="book-cover-card --has-ribbon">
          <SafeImg
            src={book.thumbnail || undefined}
            alt={[book.title, book.subTitle].join(' ')}
            placeholder="/img/book.png"
          />

          {sold ? (
            <p>
              <span>Sold</span>
            </p>
          ) : null}
        </div>
      </IonCardContent>

      <IonItem lines="inset">
        {listing.__typename === 'Listing' ? (
          <IonButtons slot="end">
            <GoToChat listing={listing} />
            <SaveListingButton listing={listing} />
          </IonButtons>
        ) : null}

        <IonLabel className="ion-text-wrap">
          {condition ? (
            <>
              <IonBadge color="success">{conditionNames[condition]}</IonBadge>
              <br />
            </>
          ) : null}

          <b>{book.authors.join(', ')}</b>

          {description ? (
            <>
              <br />
              {description}
            </>
          ) : null}
        </IonLabel>
      </IonItem>

      {detailed ? (
        <IonItem lines="inset">
          <IonLabel className="ion-text-wrap">
            {book.isbn.map(isbn => (
              <small key={isbn}>
                <b>ISBN: </b> {isbn}
                <br />
              </small>
            ))}

            {book.publishedAt ? (
              <small>
                <b>Published on: </b>
                {new Date(book.publishedAt).toLocaleDateString()}
                <br />
              </small>
            ) : null}
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
    <IonItem lines="none">
      <IonIcon slot="start" color="dark" ios={person} md={person} />
      <IonLabel>{school.name}</IonLabel>
    </IonItem>
  );
});

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
      <div className="book-cover-card">
        <IonSkeletonText animated={animated} />
      </div>
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

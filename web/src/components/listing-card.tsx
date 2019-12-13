import {
  IonBadge,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonSkeletonText,
} from '@ionic/react';
import range from 'lodash/range';
import React, { memo, NamedExoticComponent } from 'react';
import { IListing, IBook } from '../schema.gql';
import { RelativeDate } from './relative-date';
import { SafeImg } from './safe-img';
import { UserBasic } from './user-details';

type BookCardProps = {
  book: IBook;
  onClick?;
  before?;
  price?: number;
  detailed?: boolean;
  description?;
  after?;
};
export const BookCard = memo<BookCardProps>(function BookCard({
  onClick,
  before,
  book,
  detailed,
  description,
  after,
  price,
}) {
  return (
    <IonCard color="white" onClick={onClick} button={!!onClick}>
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
        <IonLabel>
          <b>{book.authors.join(', ')}</b> {description}
        </IonLabel>
      </IonItem>

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
export const ListingCard = memo<Props>(function ListingCard({
  onClick,
  listing,
  detailed = false,
}) {
  return (
    <BookCard
      onClick={onClick}
      book={listing.book}
      price={listing.price}
      description={listing.description}
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
}) as NamedExoticComponent<Props> & { loading };

export const LoadingListingCard = ({ animated = true }) => (
  <IonCard color="white">
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
          <IonSkeletonText animated={animated} style={{ width: '20%' }} />
        </small>
      </IonLabel>
    </IonItem>
  </IonCard>
);

ListingCard.loading = range(10).map(n => (
  <LoadingListingCard key={n} animated />
));

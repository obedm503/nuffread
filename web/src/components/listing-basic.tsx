import { IonBadge, IonItem, IonLabel, IonSkeletonText } from '@ionic/react';
import range from 'lodash/range';
import React, { FC, memo, NamedExoticComponent } from 'react';
import { IBook, IGoogleBook, IListing } from '../schema.gql';
import { SafeImg } from './safe-img';

export const BookBasic: FC<{
  book: IBook | IGoogleBook;
  onClick?: () => void;
  disabled?: boolean;
  color?: string;
}> = memo(function BookBasic({
  book,
  onClick: handleClick,
  disabled = false,
  color,
  children,
}) {
  return (
    <IonItem
      button={!!handleClick}
      onClick={handleClick}
      disabled={disabled}
      color={color}
    >
      <SafeImg
        src={book.thumbnail || undefined}
        alt={book.title}
        placeholder="/img/book.png"
        slot="start"
        className="book-cover-basic"
      />

      <IonLabel class="ion-text-wrap">
        {book.title}
        <br />

        {book.subTitle ? (
          <>
            <small>{book.subTitle}</small>
            <br />
          </>
        ) : null}

        <small>{book.authors.join(', ')}</small>

        {children}
      </IonLabel>
    </IonItem>
  );
});

type Props = {
  listing: IListing;
  disabled?: boolean;
  onClick?: (id: string) => void;
};
export const ListingBasic = memo<Props>(function ListingBasic({
  listing,
  disabled = false,
  onClick,
}) {
  const handleClick = React.useCallback(() => onClick && onClick(listing.id), [
    onClick,
    listing,
  ]);
  return (
    <BookBasic book={listing.book} onClick={handleClick} disabled={disabled}>
      <br />
      <IonBadge color="secondary">${listing.price / 100}</IonBadge>
    </BookBasic>
  );
}) as NamedExoticComponent<Props> & { loading };

const Loading = () => (
  <IonItem>
    <IonSkeletonText slot="start" animated className="book-cover-basic" />
    <IonLabel class="ion-text-wrap">
      <IonSkeletonText animated style={{ width: '90%' }} />
      <small>
        <IonSkeletonText animated style={{ width: '60%' }} />
      </small>
      <small>
        <IonSkeletonText animated style={{ width: '50%' }} />
      </small>
    </IonLabel>
  </IonItem>
);

ListingBasic.loading = range(10).map(n => <Loading key={n} />);

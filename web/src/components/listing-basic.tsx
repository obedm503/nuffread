import { IonBadge, IonItem, IonLabel, IonSkeletonText } from '@ionic/react';
import range from 'lodash/range';
import React, { FC, memo, NamedExoticComponent } from 'react';
import { IBook, IGoogleBook, IListing } from '../schema.gql';
import { SafeImg } from './safe-img';

export const Book: FC<{
  book: IBook | IGoogleBook;
  onClick?;
  disabled?;
  color?: string;
}> = memo(function Book({ book, onClick, disabled, color, children }) {
  return (
    <IonItem
      button={!!onClick}
      onClick={onClick}
      disabled={disabled}
      color={color}
    >
      <SafeImg
        src={book.thumbnail || undefined}
        alt={book.title}
        placeholder="/img/book.png"
        slot="start"
        style={{ width: '40%', marginTop: '4px', marginBottom: '4px' }}
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
  onClick?;
};
export const ListingBasic = memo<Props>(function ListingBasic({
  listing,
  disabled = false,
  onClick,
}) {
  return (
    <Book book={listing.book} onClick={onClick} disabled={disabled}>
      <br />
      <IonBadge color="secondary">${listing.price / 100}</IonBadge>
    </Book>
  );
}) as NamedExoticComponent<Props> & { loading };

const Loading = () => (
  <IonItem>
    <IonSkeletonText
      slot="start"
      animated
      style={{
        // 6:9 aspect ratio
        width: '40%',
        paddingTop: '66%',
        marginTop: '4px',
        marginBottom: '4px',
      }}
    />
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

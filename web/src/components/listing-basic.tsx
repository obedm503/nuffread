import { IonBadge, IonItem, IonLabel, IonSkeletonText } from '@ionic/react';
import range from 'lodash/range';
import React, { memo, NamedExoticComponent } from 'react';
import { IListing } from '../schema.gql';
import { SafeImg } from './safe-img';

type Props = {
  onClick?;
  listing: IListing;
  disabled?: boolean;
};
export const ListingBasic = memo<Props>(function ListingBasic({
  onClick,
  listing,
  disabled = false,
}) {
  return (
    <IonItem button={!!onClick} onClick={onClick} disabled={disabled}>
      <SafeImg
        src={listing.book.thumbnail || undefined}
        alt={listing.book.title}
        placeholder="/img/book.png"
        slot="start"
        style={{ width: '40%', marginTop: '4px', marginBottom: '4px' }}
      />

      <IonLabel class="ion-text-wrap">
        {listing.book.title}
        <br />

        {listing.book.subTitle ? (
          <>
            <small>{listing.book.subTitle}</small>
            <br />
          </>
        ) : null}

        <small>{listing.book.authors.join(', ')}</small>
        <br />
        <IonBadge color="secondary">${listing.price / 100}</IonBadge>
      </IonLabel>
    </IonItem>
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

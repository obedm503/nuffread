import { IonBadge, IonItem, IonLabel, IonSkeletonText } from '@ionic/react';
import range from 'lodash/range';
import React from 'react';
import { IListing } from '../schema.gql';
import { SafeImg } from './safe-img';

export const ListingBasic: React.FC<{
  onClick?;
  listing: IListing;
  disabled?: boolean;
}> & { loading } = ({ onClick, listing, disabled = false }) => (
  <IonItem button={!!onClick} onClick={onClick} disabled={disabled}>
    <SafeImg
      src={listing.book.thumbnail}
      alt={listing.book.title}
      placeholder="/img/book.png"
      slot="start"
      style={{ width: '40%' }}
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

const Loading = () => (
  <IonItem>
    <IonSkeletonText
      slot="start"
      animated
      style={{ width: '128px', height: '180px' }} // 9:6 aspect ratio
    />
    <IonLabel class="ion-text-wrap">
      <IonSkeletonText animated style={{ width: '90%' }} />
      <IonSkeletonText animated style={{ width: '60%' }} />
      <IonSkeletonText animated style={{ width: '50%' }} />
    </IonLabel>
  </IonItem>
);

ListingBasic.loading = range(10).map(n => <Loading key={n} />);

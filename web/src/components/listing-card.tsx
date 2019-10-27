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
import React from 'react';
import { IListing } from '../schema.gql';
import { RelativeDate } from './relative-date';
import { SafeImg } from './safe-img';

export const ListingCard: React.FC<{
  onClick?;
  listing: IListing;
  detailed?: boolean;
}> & { loading } = ({ onClick, listing, detailed = false }) => (
  <IonCard color="white" onClick={onClick} button={!!onClick}>
    <IonCardHeader>
      <IonCardTitle>
        {listing.book.title}

        <IonBadge
          color="secondary"
          style={{ fontSize: 'inherit', float: 'right' }}
        >
          ${listing.price / 100}
        </IonBadge>
      </IonCardTitle>

      {listing.book.subTitle ? (
        <IonCardSubtitle>{listing.book.subTitle}</IonCardSubtitle>
      ) : null}
    </IonCardHeader>

    <IonCardContent>
      <SafeImg
        src={listing.book.thumbnail}
        alt={[listing.book.title, listing.book.subTitle].join(' ')}
        placeholder="/img/book.png"
        style={{
          width: 'auto',
          maxHeight: '55vh',
          minHeight: '35vh',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
    </IonCardContent>

    <IonItem lines="inset">
      <IonLabel>
        <b>{listing.book.authors.join(', ')}</b> {listing.description}
      </IonLabel>
    </IonItem>

    {detailed
      ? listing.book.isbn.map(isbn => (
          <IonItem lines="inset" key={isbn}>
            <IonLabel>
              <small>
                <b>ISBN: </b> {isbn}
              </small>
            </IonLabel>
          </IonItem>
        ))
      : null}

    {detailed && listing.book.publishedAt ? (
      <IonItem lines="inset">
        <IonLabel>
          <small>
            <b>Published on: </b>
            {new Date(listing.book.publishedAt).toLocaleDateString()}
          </small>
        </IonLabel>
      </IonItem>
    ) : null}

    <IonItem lines="none">
      <IonLabel>
        <small>
          <RelativeDate date={listing.createdAt} />
        </small>
      </IonLabel>
    </IonItem>
  </IonCard>
);

const Loading = () => (
  <IonCard color="white">
    <IonCardHeader>
      <IonCardTitle>
        <IonSkeletonText animated style={{ width: '90%', height: '1em' }} />
      </IonCardTitle>

      <IonCardSubtitle>
        <IonSkeletonText animated style={{ width: '45%', height: '1em' }} />
      </IonCardSubtitle>
    </IonCardHeader>

    <IonCardContent>
      <IonSkeletonText
        slot="start"
        animated
        style={{ width: '100%', height: '55vh' }} // 9:6 aspect ratio
      />
    </IonCardContent>

    <IonItem lines="inset">
      <IonLabel>
        <IonSkeletonText animated style={{ width: '100%', height: '1em' }} />
      </IonLabel>
    </IonItem>
    <IonItem lines="none">
      <IonLabel>
        <small>
          <IonSkeletonText animated style={{ width: '20%', height: '1em' }} />
        </small>
      </IonLabel>
    </IonItem>
  </IonCard>
);

ListingCard.loading = range(10).map(n => <Loading key={n} />);

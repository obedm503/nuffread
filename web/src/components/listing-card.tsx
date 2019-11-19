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
import { IListing } from '../schema.gql';
import { RelativeDate } from './relative-date';
import { SafeImg } from './safe-img';

const badgeStyle = { fontSize: 'inherit', float: 'right' };
const imgStyle = {
  width: 'auto',
  maxHeight: '70vh',
  minHeight: '35vh',
  margin: '4px auto 4px auto',
};
const placeholderImgStyle = {
  // 6:9 aspect ratio
  width: 'calc(70vh * 6 / 9)',
  height: '70vh',
  margin: '4px auto 4px auto',
};
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
    <IonCard color="white" onClick={onClick} button={!!onClick}>
      <IonCardHeader>
        <IonCardTitle>
          {listing.book.title}

          <IonBadge color="secondary" style={badgeStyle}>
            ${listing.price / 100}
          </IonBadge>
        </IonCardTitle>

        {listing.book.subTitle ? (
          <IonCardSubtitle>{listing.book.subTitle}</IonCardSubtitle>
        ) : null}
      </IonCardHeader>

      <IonCardContent>
        <SafeImg
          src={listing.book.thumbnail || undefined}
          alt={[listing.book.title, listing.book.subTitle].join(' ')}
          placeholder="/img/book.png"
          style={imgStyle}
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
}) as NamedExoticComponent<Props> & { loading };

const Loading = () => (
  <IonCard color="white">
    <IonCardHeader>
      <IonCardTitle>
        <IonSkeletonText animated style={{ width: '90%' }} />
      </IonCardTitle>

      <IonCardSubtitle>
        <IonSkeletonText animated style={{ width: '45%' }} />
      </IonCardSubtitle>
    </IonCardHeader>

    <IonCardContent>
      <IonSkeletonText slot="start" animated style={placeholderImgStyle} />
    </IonCardContent>

    <IonItem lines="inset">
      <IonLabel>
        <IonSkeletonText animated style={{ width: '100%' }} />
      </IonLabel>
    </IonItem>
    <IonItem lines="none">
      <IonLabel>
        <small>
          <IonSkeletonText animated style={{ width: '20%' }} />
        </small>
      </IonLabel>
    </IonItem>
  </IonCard>
);

ListingCard.loading = range(10).map(n => <Loading key={n} />);

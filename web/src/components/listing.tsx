import {
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCol,
  IonFab,
  IonFabButton,
  IonItem,
  IonLabel,
  IonRow,
  IonSkeletonText,
} from '@ionic/react';
import * as React from 'react';
import { IBook, IListing } from '../schema.gql';
import { SafeImg } from './safe-img';

export const LoadingListing = () => (
  <IonItem>
    <IonSkeletonText
      animated
      slot="start"
      style={{ width: '120px', height: '150px' }}
    />

    <IonLabel>
      <h3>
        <IonSkeletonText animated style={{ maxWidth: '80%' }} />
      </h3>

      <p>
        <IonSkeletonText animated style={{ maxWidth: '50%' }} />
      </p>

      <p>
        <IonSkeletonText animated style={{ maxWidth: '40%' }} />
      </p>

      <p>
        <IonSkeletonText animated style={{ maxWidth: '40%' }} />
      </p>

      <p>
        <IonSkeletonText animated style={{ maxWidth: '40%' }} />
      </p>

      <p>
        <IonSkeletonText animated style={{ maxWidth: '40%' }} />
      </p>
    </IonLabel>
  </IonItem>
);

export const Listing: React.SFC<{
  listing: IListing | IBook;
  onClick?: () => void;
  priceColor?: string;
}> = ({ listing, onClick, children, priceColor = 'medium' }) => (
  <IonCard
    onClick={onClick}
    color="white"
    style={{ marginTop: '44px', overflow: 'visible' }}
  >
    {'price' in listing ? (
      <IonFab edge vertical="top" horizontal="end" slot="fixed">
        <IonFabButton color={priceColor}>
          <b>${listing.price / 100}</b>
        </IonFabButton>
      </IonFab>
    ) : null}

    <IonCardHeader>
      <IonCardTitle>{listing.title}</IonCardTitle>

      {listing.subTitle ? (
        <IonCardSubtitle>{listing.subTitle}</IonCardSubtitle>
      ) : null}
    </IonCardHeader>

    <IonRow>
      <IonCol>
        <SafeImg
          placeholder="/img/128x128.png"
          src={listing.thumbnail || undefined}
          alt={[listing.title, listing.subTitle].join(' ')}
          style={{ width: '100%', height: 'auto' }}
        />
      </IonCol>
      <IonCol>
        <IonLabel>
          <p>
            <small>{listing.authors.join(' & ')}</small>
          </p>

          {listing.isbn.map(isbn => (
            <p key={isbn}>
              <small>
                <b>ISBN: </b>
                {isbn}
              </small>
            </p>
          ))}

          {listing.publishedAt ? (
            <p>
              <small>
                <b>Published on: </b>
                {new Date(listing.publishedAt).toLocaleDateString()}
              </small>
            </p>
          ) : null}

          {'createdAt' in listing ? (
            <p>
              <small>
                <b>Posted on: </b>
                {new Date(listing.createdAt).toLocaleDateString()}
              </small>
            </p>
          ) : null}
        </IonLabel>
      </IonCol>
    </IonRow>

    {children ? <IonItem>{children}</IonItem> : null}
  </IonCard>
);

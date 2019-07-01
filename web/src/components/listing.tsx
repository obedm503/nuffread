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
import { IListing } from '../schema.gql';
import { classes } from '../util';
import { SafeImg } from './safe-img';

export const LoadingListing = () => (
  <IonCard class="listing-card" color="white">
    <IonFab edge vertical="top" horizontal="end">
      <IonFabButton color="light" style={{ width: '70px', height: '70px' }}>
        <IonSkeletonText animated style={{ height: '100%' }} />
      </IonFabButton>
    </IonFab>

    <IonCardHeader>
      <IonCardTitle>
        <IonSkeletonText animated style={{ maxWidth: '60%', height: '33px' }} />
      </IonCardTitle>
    </IonCardHeader>

    <IonRow>
      <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="2" sizeXl="1">
        <IonSkeletonText animated style={{ height: '200px' }} />
      </IonCol>

      <IonCol>
        <IonLabel>
          <h3>
            <IonSkeletonText
              animated
              style={{ maxWidth: '80%', height: '18px', marginBottom: '1px' }}
            />
          </h3>

          <p>
            <IonSkeletonText
              animated
              style={{ maxWidth: '50%', height: '18px', marginBottom: '1px' }}
            />
          </p>

          <p>
            <IonSkeletonText
              animated
              style={{ maxWidth: '40%', height: '18px', marginBottom: '1px' }}
            />
          </p>

          <p>
            <IonSkeletonText
              animated
              style={{ maxWidth: '40%', height: '18px', marginBottom: '1px' }}
            />
          </p>

          <p>
            <IonSkeletonText
              animated
              style={{ maxWidth: '40%', height: '18px', marginBottom: '1px' }}
            />
          </p>

          <p>
            <IonSkeletonText
              animated
              style={{ maxWidth: '40%', height: '18px', marginBottom: '1px' }}
            />
          </p>
        </IonLabel>
      </IonCol>
    </IonRow>
  </IonCard>
);

export const Listing: React.SFC<{
  listing: IListing;
  onClick?: () => void;
  priceColor?: string;
}> = ({ listing, onClick, children, priceColor = 'medium' }) => (
  <IonCard
    class={classes('listing-card', { large: priceColor === 'success' })}
    onClick={onClick}
    color="white"
  >
    <IonFab edge vertical="top" horizontal="end">
      <IonFabButton color="success">
        <b>${listing.price / 100}</b>
      </IonFabButton>
    </IonFab>

    <IonCardHeader>
      <IonCardTitle>{listing.title}</IonCardTitle>

      {listing.subTitle ? (
        <IonCardSubtitle>{listing.subTitle}</IonCardSubtitle>
      ) : null}
    </IonCardHeader>

    <IonRow>
      <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="2" sizeXl="1">
        <SafeImg
          placeholder="/img/128x128.png"
          src={listing.thumbnail || undefined}
          alt={[listing.title, listing.subTitle].join(' ')}
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

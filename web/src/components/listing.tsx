import {
  IonBadge,
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
  IonText,
} from '@ionic/react';
import * as React from 'react';
import { IListing } from '../schema.gql';
import { classes } from '../util';
import { WrapLabel } from './ionic';
import { SafeImg } from './safe-img';

export const LoadingListing = () => (
  <IonCard className="listing-card" color="white">
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

export const Listing: React.FC<{
  listing: IListing;
  onClick?: () => void;
}> = ({ listing, onClick, children }) => (
  <IonCard
    className={classes('listing-card', { large: false })}
    onClick={onClick}
    color="white"
  >
    <IonFab edge vertical="top" horizontal="end">
      <IonFabButton>
        <IonText>
          <b>${listing.price / 100}</b>
        </IonText>
      </IonFabButton>
    </IonFab>

    <IonCardHeader>
      <IonCardTitle>{listing.book.title}</IonCardTitle>

      {listing.book.subTitle ? (
        <IonCardSubtitle>{listing.book.subTitle}</IonCardSubtitle>
      ) : null}
    </IonCardHeader>

    <IonRow>
      <IonCol size="6" sizeSm="4" sizeMd="3" sizeLg="2" sizeXl="1">
        <SafeImg
          placeholder="/img/book.png"
          src={listing.book.thumbnail || undefined}
          alt={[listing.book.title, listing.book.subTitle].join(' ')}
        />
      </IonCol>

      <IonCol>
        <IonLabel>
          <p>
            <small>{listing.book.authors.join(', ')}</small>
          </p>

          {listing.book.isbn.map(isbn => (
            <p key={isbn}>
              <small>
                <b>ISBN: </b>
                {isbn}
              </small>
            </p>
          ))}

          {listing.book.publishedAt ? (
            <p>
              <small>
                <b>Published on: </b>
                {new Date(listing.book.publishedAt).toLocaleDateString()}
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

    {children ? <IonItem lines="none">{children}</IonItem> : null}
  </IonCard>
);

export const BasicListing: React.FC<{ onClick?; listing: IListing }> = ({
  onClick,
  listing,
}) => (
  <IonItem button={!!onClick} onClick={onClick}>
    <SafeImg
      src={listing.book.thumbnail}
      alt={listing.book.title}
      placeholder="/img/book.png"
      slot="start"
    />
    <WrapLabel text-wrap>
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
    </WrapLabel>
  </IonItem>
);
export const BasicListingLoading = () => (
  <IonItem>
    <IonSkeletonText
      slot="start"
      animated
      style={{ width: '128px', height: '180px' }} // 9:6 aspect ratio
    />
    <WrapLabel>
      <IonSkeletonText animated style={{ width: '90%' }} />
      <IonSkeletonText animated style={{ width: '60%' }} />
      <IonSkeletonText animated style={{ width: '50%' }} />
    </WrapLabel>
  </IonItem>
);

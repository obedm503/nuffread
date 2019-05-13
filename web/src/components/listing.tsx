import { IonBadge, IonImg, IonItem, IonLabel } from '@ionic/react';
import * as React from 'react';
import { IBook, IListing } from '../../../schema.gql';
import { Color } from '../util';

export const Listing: React.SFC<{
  listing: IListing | IBook;
  onClick?;
  priceColor?: Color;
}> = ({ listing, onClick, children, priceColor = 'light' }) => (
  <IonItem onClick={onClick}>
    <IonImg slot="start" src={listing.thumbnail || '/img/128x128.png'} />

    <IonLabel text-wrap>
      <p>
        <strong>
          {listing.title}
          {listing.subTitle ? ' - ' + listing.subTitle : ''}
        </strong>
      </p>
      <p>
        <small>{listing.authors.join(', ')}</small>
        <br />
        <small>
          <b>ISBN: </b>
          {listing.isbn.join(', ')}
        </small>

        {'seller' in listing ? (
          <>
            <br />
            <small>
              <b>Sold By: </b> {listing.seller.name}
            </small>
          </>
        ) : null}

        {listing.publishedAt ? (
          <>
            <br />
            <small>
              <b>Published on: </b>
              {new Date(listing.publishedAt).toLocaleDateString()}
            </small>
          </>
        ) : null}

        {'createdAt' in listing ? (
          <>
            <br />
            <small>
              <b>Posted on: </b>
              {new Date(listing.createdAt).toLocaleDateString()}
            </small>
          </>
        ) : null}
      </p>

      {children}
    </IonLabel>

    {'price' in listing ? (
      <IonBadge color={priceColor}>${listing.price / 100}</IonBadge>
    ) : null}
  </IonItem>
);

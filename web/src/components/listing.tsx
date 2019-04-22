import { IonBadge, IonImg } from '@ionic/react';
import * as React from 'react';
import { IBook, IListing } from '../../../schema.gql';
import { Color } from '../util';

export const Listing: React.SFC<{
  listing: IListing | IBook;
  onClick?;
  priceColor?: Color;
  priceSize?: 'medium' | 'large';
}> = ({
  listing,
  onClick,
  children,
  priceColor = 'light',
  priceSize = 'medium',
}) => (
  <div onClick={onClick}>
    <div>
      <IonImg
        // isSize="128x128"
        src={listing.thumbnail || '/img/128x128.png'}
      />
    </div>
    <div>
      <div>
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
      </div>

      {children}
    </div>

    {'price' in listing ? (
      <div>
        <IonBadge color={priceColor}>${listing.price / 100}</IonBadge>
      </div>
    ) : null}
  </div>
);

import {
  Content,
  Image,
  Media,
  MediaContent,
  MediaLeft,
  MediaRight,
  Tag,
} from 'bloomer';
import * as React from 'react';
import { Color } from '../util';

export const Listing: React.SFC<{
  listing: GQL.IListing | GQL.IBook;
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
  <Media onClick={onClick}>
    <MediaLeft>
      <Image
        // isSize="128x128"
        src={listing.thumbnail || '/img/128x128.png'}
      />
    </MediaLeft>
    <MediaContent>
      <Content>
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
      </Content>

      {children}
    </MediaContent>

    {'price' in listing ? (
      <MediaRight>
        <Tag isColor={priceColor} isSize={priceSize}>
          ${listing.price / 100}
        </Tag>
      </MediaRight>
    ) : null}
  </Media>
);

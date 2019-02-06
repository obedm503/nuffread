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

export const Listing: React.SFC<{
  listing: GQL.IListing;
  isActive?: boolean;
  isFirst?: boolean;
  onClick?;
}> = ({ listing, isActive, isFirst, onClick, children }) => (
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
          <br />
          <small>
            <b>Sold By: </b> {listing.seller.name}
          </small>
          <small>
            <b>Posted on: </b>
            {new Date(listing.publishedAt).toLocaleDateString()}
          </small>
          <br />
          <small>
            <b>Sold By: </b> {listing.seller.name}
          </small>
        </p>
      </Content>

      {children}
    </MediaContent>
    <MediaRight>
      <Tag
        isColor={isActive ? 'success' : 'light'}
        isSize={isFirst ? 'large' : 'medium'}
      >
        ${listing.price / 100}
      </Tag>
    </MediaRight>
  </Media>
);

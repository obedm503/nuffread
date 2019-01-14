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

export const ListingBasic = ({ isFirst, price, onClick, isActive }) => (
  <Media onClick={onClick}>
    <MediaLeft>
      <Image isSize="64x64" src="/public/128x128.png" />
    </MediaLeft>
    <MediaContent>
      <Content>
        <p>
          <strong>The Hobbit</strong> <small>JRR Tolkien</small>
          <br />
          <small>
            <b>ISBN: </b>7382716921767
          </small>
          <br />
          <small>
            <b>Sold By: </b>John Doe
          </small>
        </p>
      </Content>
    </MediaContent>
    <MediaRight>
      <Tag
        isColor={isActive ? 'success' : 'light'}
        isSize={isFirst ? 'large' : 'medium'}
      >
        ${price}
      </Tag>
    </MediaRight>
  </Media>
);

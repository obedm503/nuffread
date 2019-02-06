import {
  Content,
  Image,
  Level,
  LevelItem,
  LevelLeft,
  Media,
  MediaContent,
  MediaLeft,
  MediaRight,
  Tag,
} from 'bloomer';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components';

export const ListingDetails: React.SFC<GQL.IListing> = item => (
  <Media>
    <MediaLeft>
      <Image
        // isSize="128x128"
        src={item.thumbnail || '/img/128x128.png'}
      />
    </MediaLeft>
    <MediaContent>
      <Content>
        <p>
          <strong>
            {item.title}
            {item.subTitle ? ' - ' + item.subTitle : ''}
          </strong>
        </p>
        <p>
          <small>{item.authors.join(' - ')}</small>
          <br />
          <small>
            <b>ISBN: </b>
            {item.isbn.join(' - ')}
          </small>
          <br />
          <small>
            <b>Sold By: </b>John Doe
          </small>
          <small>
            <b>Posted </b>
            {new Date(item.publishedAt).toLocaleDateString()}
          </small>
        </p>
      </Content>
      <Level isMobile>
        <LevelLeft>
          <LevelItem>
            <Link to={`/${item.id}/details`}>
              <Tag isColor="info" isSize="medium">
                More Details
              </Tag>
            </Link>
          </LevelItem>
          <LevelItem href="#">
            <Icon size="small" name="barcode" />
          </LevelItem>
        </LevelLeft>
      </Level>
    </MediaContent>
    <MediaRight>
      <Tag isColor="success" isSize="large">
        ${item.price / 100}
      </Tag>
    </MediaRight>
  </Media>
);

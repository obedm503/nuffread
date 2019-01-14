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

export const ListingDetails: React.SFC<{
  listingId: string;
  price: string;
}> = ({ listingId, price }) => {
  return (
    <Media>
      <MediaLeft>
        <Image isSize="128x128" src="/public/128x128.png" />
      </MediaLeft>
      <MediaContent>
        <Content>
          <p>
            <strong>The Hobbit</strong> <small>JRR Tolkien</small>
            <br />
            <small>
              <b>ISBN </b>7382716921767
            </small>
            <br />
            <small>
              <b>Posted </b>
              {new Date().toLocaleDateString()}
            </small>
          </p>
        </Content>
        <Level isMobile>
          <LevelLeft>
            <LevelItem>
              <Link to={`/${listingId}/details`}>
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
          ${price}
        </Tag>
      </MediaRight>
    </Media>
  );
};

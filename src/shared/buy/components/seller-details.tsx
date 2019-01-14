import * as React from 'react';
import {
  Media,
  MediaLeft,
  Image,
  MediaContent,
  Content,
  Level,
  LevelLeft,
  LevelItem,
} from 'bloomer';
import { Icon } from '../../components';

export const SellerDetails: React.SFC<{
  listingId: string;
  price: string;
}> = () => (
  <Media>
    <MediaLeft>
      <Image isSize="128x128" src="/public/128x128.png" />
    </MediaLeft>
    <MediaContent>
      <Content>
        <p>
          <strong>John Doe</strong>
          <br />
          <small>Dordt University</small>
          <br />
          <small>
            <a href="mailto: john.doe@mail.com">john.doe@mail.com</a>
          </small>
          <br />
          <small>
            <a href="tel: +123456789">+123456789</a>
          </small>
        </p>
      </Content>
      <Level isMobile>
        <LevelLeft>
          <LevelItem href="#">
            <Icon size="small" name="call" />
          </LevelItem>
          <LevelItem href="#">
            <Icon size="small" name="logo-facebook" />
          </LevelItem>
          <LevelItem href="#">
            <Icon size="small" name="mail" />
          </LevelItem>
        </LevelLeft>
      </Level>
    </MediaContent>
  </Media>
);

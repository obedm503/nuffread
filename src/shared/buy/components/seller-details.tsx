import {
  Content,
  Image,
  Level,
  LevelItem,
  LevelLeft,
  Media,
  MediaContent,
  MediaLeft,
} from 'bloomer';
import * as React from 'react';
import { IonIcon } from '../../components';

export const SellerDetails: React.SFC<{
  listingId: string;
}> = () => (
  <Media>
    <MediaLeft>
      <Image
        // isSize="128x128"
        src="/img/128x128.png"
      />
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
            <IonIcon size="small" name="call" />
          </LevelItem>
          <LevelItem href="#">
            <IonIcon size="small" name="logo-facebook" />
          </LevelItem>
          <LevelItem href="#">
            <IonIcon size="small" name="mail" />
          </LevelItem>
        </LevelLeft>
      </Level>
    </MediaContent>
  </Media>
);

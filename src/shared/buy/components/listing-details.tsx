import { Level, LevelItem, LevelLeft, Tag } from 'bloomer';
import { resolve } from 'path';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components';
import { Listing } from '../../components/listing';

export const ListingDetails: React.SFC<{
  listing: GQL.IListing;
  base: string;
}> = ({ listing, base }) => (
  <Listing priceColor="success" priceSize="large" listing={listing}>
    <Level isMobile>
      <LevelLeft>
        <LevelItem>
          <Link to={resolve(base, 'details')}>
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
  </Listing>
);

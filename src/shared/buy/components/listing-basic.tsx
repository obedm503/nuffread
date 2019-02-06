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
import { Query, QueryResult } from 'react-apollo';
import { SEARCH } from '../../queries';
import { Error } from '../../components';

export const ListingBasic = ({
  isFirst,
  onClick,
  isActive,
  listing,
}: {
  listing: GQL.IListing;
  isFirst: boolean;
  onClick;
  isActive: boolean;
}) => (
  <Query query={SEARCH}>
    {({ error, data }: QueryResult<GQL.IQuery>) => {
      if (error || !data || !data.search) {
        return <Error value={error} />;
      }

      return (
        <Media onClick={onClick}>
          <MediaLeft>
            <Image
              // isSize="64x64"
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
                <small>{listing.authors.join(' - ')}</small>
                <br />
                <small>
                  <b>ISBN: </b>
                  {listing.isbn.join(' - ')}
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
              ${listing.price / 100}
            </Tag>
          </MediaRight>
        </Media>
      );
    }}
  </Query>
);

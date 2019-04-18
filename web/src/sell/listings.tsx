import { Column, Columns, Container } from 'bloomer';
import gql from 'graphql-tag';
import * as React from 'react';
import { Query } from 'react-apollo';
import { Listing } from '../components/listing';
import { Error } from '../components';
import { BASIC_LISTING } from '../queries';

const MY_LISTINGS = gql`
  ${BASIC_LISTING}

  query GetMyListings {
    me {
      ... on Seller {
        id
        listings {
          ...BasicListing
        }
      }
    }
  }
`;

export const Listings: React.SFC = () => (
  <Container>
    <Columns isMultiline>
      <Query<GQL.IQuery> query={MY_LISTINGS}>
        {({ loading, error, data }) => {
          if (loading) {
            return null;
          }
          if (error || !data || !data.me || data.me.__typename !== 'Seller') {
            return <Error value={error} />;
          }

          if (!data.me.listings.length) {
            return <Column>No listings posted</Column>;
          }

          return data.me.listings.map(listing => {
            return (
              <Column isSize="full" key={listing.id}>
                <Listing listing={listing} />
              </Column>
            );
          });
        }}
      </Query>
    </Columns>
  </Container>
);

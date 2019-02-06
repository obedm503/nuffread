import gql from 'graphql-tag';

export const SEARCH = gql`
  query Search($query: String) {
    search(query: $query) {
      id
      isbn
      thumbnail
      title
      subTitle
      publishedAt
      authors
      price

      seller {
        id
        name
      }
    }
  }
`;

export const GET_LISTING = gql`
  query GetListing($id: ID!) {
    listing(id: $id) {
      id
      isbn
      thumbnail
      title
      subTitle
      publishedAt
      authors
      price

      seller {
        id
        name
      }
    }
  }
`;

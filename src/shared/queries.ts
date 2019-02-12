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

export const BASIC_LISTING = gql`
  fragment BasicListing on Listing {
    id
    createdAt
    isbn
    thumbnail
    title
    subTitle
    publishedAt
    authors
    price
  }
`;

export const GET_LISTING = gql`
  ${BASIC_LISTING}

  query GetListing($id: ID!) {
    listing(id: $id) {
      ...BasicListing

      seller {
        id
        name
      }
    }
  }
`;

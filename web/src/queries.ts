import gql from 'graphql-tag';

export const BASIC_LISTING = gql`
  fragment BasicListing on Listing {
    id
    createdAt
    price
    book {
      isbn
      thumbnail
      title
      subTitle
      publishedAt
      authors
    }
  }
`;

export const SEARCH = gql`
  ${BASIC_LISTING}

  query Search($query: String!) {
    search(query: $query) {
      ...BasicListing

      user {
        id
        name
      }
    }
  }
`;

export const SEARCH_GOOGLE = gql`
  query SearchGoogle($query: String!) {
    searchGoogle(query: $query) {
      id
      isbn
      thumbnail
      title
      subTitle
      publishedAt
      authors
    }
  }
`;

export const GET_LISTING = gql`
  ${BASIC_LISTING}

  query GetListing($id: ID!) {
    listing(id: $id) {
      ...BasicListing

      user {
        id
        name
      }
    }
  }
`;

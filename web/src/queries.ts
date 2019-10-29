import gql from 'graphql-tag';

export const BASIC_LISTING = gql`
  fragment BasicListing on Listing {
    id
    createdAt
    price
    description
    book {
      id
      googleId
      isbn
      thumbnail
      title
      subTitle
      publishedAt
      authors
    }
  }
`;

export const MY_LISTINGS = gql`
  ${BASIC_LISTING}

  query GetMyListings {
    me {
      ... on User {
        id
        listings {
          ...BasicListing
        }
      }
    }
  }
`;

export const SEARCH = gql`
  ${BASIC_LISTING}

  query Search($query: String!) {
    search(query: $query) {
      ...BasicListing
    }
  }
`;

export const SEARCH_GOOGLE = gql`
  query SearchGoogle($query: String!) {
    searchGoogle(query: $query) {
      googleId
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
    }
  }
`;

export const CREATE_LISTING = gql`
  ${BASIC_LISTING}

  mutation CreateListing(
    $googleId: String!
    $price: Int!
    $description: String!
  ) {
    createListing(
      listing: { googleId: $googleId, price: $price, description: $description }
    ) {
      ...BasicListing
    }
  }
`;

import gql from 'graphql-tag';

export const BOOK = gql`
  fragment Book on Book {
    id
    googleId
    isbn
    thumbnail
    title
    subTitle
    publishedAt
    authors
  }
`;

export const BASIC_LISTING = gql`
  ${BOOK}

  fragment BasicListing on Listing {
    id
    createdAt
    price
    description
    saved
    book {
      ...Book
    }
    school {
      id
      name
    }
  }
`;

export const SAVED_LISTINGS = gql`
  ${BASIC_LISTING}

  query GetSavedListings($offset: Int!) {
    me {
      ... on User {
        id
        saved(paginate: { offset: $offset }) {
          totalCount
          items {
            ...BasicListing
          }
        }
      }
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

      book {
        id
        listings {
          totalCount
        }
      }
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

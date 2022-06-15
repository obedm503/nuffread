import { gql } from '@apollo/client';

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

export const LISTING = gql`
  fragment Listing on Listing {
    id
    createdAt
    price
    description
    saved
    soldAt
    soldPrice
    condition
    school {
      id
      name
    }
  }
`;

export const BASIC_LISTING = gql`
  ${BOOK}
  ${LISTING}

  fragment BasicListing on Listing {
    ...Listing
    book {
      ...Book
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

            user {
              id
              name
              email
              school {
                id
                name
              }
            }
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

export const GET_LISTING = gql`
  ${BASIC_LISTING}

  query GetListing($id: ID!) {
    listing(id: $id) {
      ...BasicListing

      user {
        id
      }

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
    $coverIndex: Int!
    $condition: ListingCondition!
  ) {
    createListing(
      listing: {
        googleId: $googleId
        price: $price
        description: $description
        coverIndex: $coverIndex
        condition: $condition
      }
    ) {
      ...BasicListing
    }
  }
`;

export const THREAD = gql`
  query GetThread($id: ID!, $offset: Int!) {
    thread(id: $id) {
      id
      lastMessage {
        id
        createdAt
        content
      }
      listing {
        id
        book {
          id
          title
        }
      }
      otherId
      other {
        id
        email
        name
      }
      messages(paginate: { limit: 20, offset: $offset }) {
        totalCount
        items {
          id
          createdAt
          content
          fromId
        }
      }
    }
  }
`;

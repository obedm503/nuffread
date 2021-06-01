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

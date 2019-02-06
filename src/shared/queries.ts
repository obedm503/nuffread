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

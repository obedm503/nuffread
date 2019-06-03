import { IonButton, IonContent } from '@ionic/react';
import gql from 'graphql-tag';
import * as React from 'react';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router';
import { Listings } from '../buy/components/listings';
import { Error, TopNav } from '../components';
import { Listing } from '../components/listing';
import { SearchBar } from '../components/search-bar';
import { IQuery } from '../schema.gql';

const GET_GOOGLE_BOOK = gql`
  query GetGoogleBook($id: ID!) {
    googleBook(id: $id) {
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

const GoogleBook: React.SFC<{ id: string }> = ({ id }) => (
  <Query<IQuery> query={GET_GOOGLE_BOOK} variables={{ id }}>
    {({ loading, error, data }) => {
      if (loading) {
        return null;
      }

      if (error || !data) {
        return <Error value={error} />;
      }

      const googleBook = data.googleBook;
      if (!googleBook) {
        return null;
      }

      return (
        <Listing priceColor="success" listing={googleBook}>
          <IonButton color="primary">Select</IonButton>
        </Listing>
      );
    }}
  </Query>
);

const SEARCH_GOOGLE = gql`
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

const SearchResults = ({
  googleId,
  onClick,
  searchValue,
  base,
}: {
  googleId?: string;
  onClick;
  base: string;
  searchValue: string;
}) => {
  return (
    <Query<IQuery> query={SEARCH_GOOGLE} variables={{ query: searchValue }}>
      {({ error, data, loading }) => {
        if (loading) {
          return null;
        }

        if (error || !data || !data.searchGoogle) {
          console.log({ error, data });
          return <Error value={error} />;
        }

        return (
          <Listings
            id={googleId}
            onClick={onClick}
            base={base}
            listings={data.searchGoogle}
            children={GoogleBook}
          />
        );
      }}
    </Query>
  );
};

export class New extends React.Component<
  RouteComponentProps<{ listingId?: string }>,
  { searchValue: string; googleId: string }
> {
  onSearch = searchValue => {
    this.setState({ searchValue });
  };

  onListingClick = id => {
    this.setState({ googleId: id });
  };

  state = { searchValue: '', googleId: '' };

  render() {
    const {
      match: { url },
    } = this.props;

    return (
      <>
        <TopNav
          toolbar={
            <SearchBar
              onSearch={this.onSearch}
              searchValue={this.state.searchValue}
            />
          }
        />

        <IonContent>
          {this.state.searchValue ? (
            <SearchResults
              onClick={this.onListingClick}
              googleId={this.state.googleId}
              searchValue={this.state.searchValue}
              base={url}
            />
          ) : (
            <div>Please scan a book</div>
          )}
        </IonContent>
      </>
    );
  }
}

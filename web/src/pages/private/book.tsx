import { IonBackButton, IonButtons, IonContent, IonPage } from '@ionic/react';
import gql from 'graphql-tag';
import React, { memo } from 'react';
import { Redirect } from 'react-router';
import {
  BookCard,
  Container,
  Error,
  ListingBasic,
  ListingCard,
  ListWrapper,
  TopNav,
} from '../../components';
import { BASIC_LISTING, BOOK } from '../../queries';
import { IQueryBookArgs } from '../../schema.gql';
import { useQuery } from '../../state/apollo';

const GET_BOOK = gql`
  ${BOOK}
  ${BASIC_LISTING}

  query GetBook($id: ID!) {
    book(id: $id) {
      ...Book

      listings {
        ...BasicListing
      }
    }
  }
`;

export const Book = memo<{ bookId: string; defaultHref: string }>(
  function Book({ bookId, defaultHref }) {
    const { data, loading, error } = useQuery<IQueryBookArgs>(GET_BOOK, {
      variables: { id: bookId },
    });
    if (error) {
      return <Error value={error} />;
    }
    const book = data && data.book;

    if (!loading && !book) {
      return <Redirect to="/" />;
    }

    return (
      <IonPage>
        <TopNav homeHref={false} title={book ? book.title : ''}>
          <IonButtons slot="start">
            <IonBackButton defaultHref={defaultHref} />
          </IonButtons>
        </TopNav>

        <IonContent>
          <Container>
            {loading ? (
              ListingCard.loading[0]
            ) : (
              <>
                <BookCard book={book!} detailed />

                <ListWrapper title="Deals">
                  {book!.listings.map(listing => (
                    <ListingBasic key={listing.id} listing={listing} />
                  ))}
                </ListWrapper>
              </>
            )}
          </Container>
        </IonContent>
      </IonPage>
    );
  },
);

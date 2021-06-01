import { gql } from '@apollo/client';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { makeGetSSP, withGraphQL } from '../../apollo-client';
import { RelativeDate } from '../../components/date';
import { Layout } from '../../components/layout';
import { BOOK, LISTING } from '../../queries';
import { ListingCondition } from '../../schema.gql';
import { useQuery } from '../../util/apollo';

function Listings({ children }) {
  return (
    <div className="p-6 flex flex-wrap items-end justify-center">
      {children}
    </div>
  );
}

const conditionNames: { [key in ListingCondition]: string } = {
  [ListingCondition.New]: 'New',
  [ListingCondition.LikeNew]: 'Used: Like New',
  [ListingCondition.VeryGood]: 'Used: Very Good',
  [ListingCondition.Good]: 'Used: Good',
  [ListingCondition.Acceptable]: 'Used: Acceptable',
};

const GET_BOOK = gql`
  ${LISTING}
  ${BOOK}

  query GetBook($id: ID!) {
    book(id: $id) {
      ...Book
      listings(paginate: { limit: 30 }) {
        totalCount
        items {
          ...Listing
          user {
            id
            name
            email
          }
        }
      }
    }
  }
`;

function BookPage() {
  const router = useRouter();
  const bookId = router?.query.id;

  const { loading, data, error } = useQuery(GET_BOOK, {
    variables: { id: bookId },
  });
  if (loading) {
    return null;
  }

  if (error) {
    console.error(error);
    return (
      <Layout>
        <Head>
          <title>Nuffread</title>
        </Head>
        <Listings>Something went wrong</Listings>
      </Layout>
    );
  }
  const book = data.book;

  return (
    <Layout>
      <Head>
        <title>{book.title} | Nuffread</title>
      </Head>

      <div className="container">
        <div className="flex">
          <div className="w-1/2 p-6">
            <div className="w-80 ml-auto overflow-hidden rounded-lg shadow-lg">
              <img
                className="w-80"
                alt={`${book.title} book cover`}
                src={book.thumbnail}
              />
            </div>
          </div>
          <div className="w-1/2 p-6">
            <span className="block font-semibold text-md">{book.title}</span>

            {book.subTitle ? (
              <span className="block text-sm">{book.subTitle}</span>
            ) : null}

            <span className="block opacity-75 text-xs">
              {book.authors.join(', ')}
            </span>

            {book.isbn.map(isbn => (
              <span className="block" key={isbn}>
                <b>ISBN: </b> {isbn}
              </span>
            ))}
            <span className="block">
              <b>Published on: </b> <RelativeDate date={book.publishedAt} />
            </span>

            <div className="max-h-96 overflow-x-auto">
              {book.listings.items.map(listing => (
                <div
                  key={listing.id}
                  className={`my-4 p-4 rounded-lg shadow-sm hover:shadow-lg ${
                    bookId === listing.id ? 'border-primary border' : ''
                  }`}
                >
                  <span className="block opacity-75 -mb-1 text-sm">
                    <RelativeDate date={listing.createdAt} />
                  </span>

                  <div className="flex justify-between">
                    <span className="block font-semibold text-lg">
                      {listing.condition
                        ? conditionNames[listing.condition]
                        : ''}
                    </span>

                    <span className="bg-primary rounded-full text-white text-md font-semibold px-3 py-2 leading-none flex items-center">
                      ${(listing.price / 100).toFixed(2)}
                    </span>
                  </div>

                  <p>{listing.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withGraphQL(BookPage);
export const getServerSideProps = makeGetSSP(BookPage);

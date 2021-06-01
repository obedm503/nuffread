import { gql } from '@apollo/client';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { memo } from 'react';
import { makeGetSSP, withGraphQL } from '../../apollo-client';
import { RelativeDate } from '../../components/date';
import { Layout } from '../../components/layout';
import { BASIC_LISTING } from '../../queries';
import { IListing, ListingCondition } from '../../schema.gql';
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

const Listing = memo<{ listing: IListing }>(({ listing }) => {
  return (
    <div className="flex-shrink-0 m-10 mx-auto relative overflow-hidden rounded-lg w-80 shadow-lg">
      <div className="px-3 pb-3 mt-3">
        <span className="block font-semibold text-md">
          {listing.book.title}
        </span>

        {listing.book.subTitle ? (
          <span className="block text-sm">{listing.book.subTitle}</span>
        ) : null}

        <span className="block opacity-75 text-xs">
          {listing.book.authors.join(', ')}
        </span>
      </div>
      <div className="relative bg-light" style={{ minHeight: '18rem' }}>
        <img
          className="w-80"
          alt={`${listing.book.title} book cover`}
          src={listing.book.thumbnail}
        />
      </div>
      <div className="px-3 pb-3 mt-3">
        {listing.book.isbn.map(isbn => (
          <span className="block" key={isbn}>
            <b>ISBN: </b> {isbn}
          </span>
        ))}
        <span className="block">
          <b>Published on: </b> <RelativeDate date={listing.book.publishedAt} />
        </span>
      </div>
    </div>
  );
});

const GET_LISTING = gql`
  ${BASIC_LISTING}

  query GetListing($id: ID!) {
    listing(id: $id) {
      ...BasicListing

      user {
        id
        name
        email
      }

      book {
        id
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
  }
`;

function Post() {
  const router = useRouter();
  const listingId = router?.query.id;

  const { loading, data, error } = useQuery(GET_LISTING, {
    variables: { id: listingId },
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
  const listing = data.listing;

  return (
    <Layout>
      <Head>
        <title>{listing.book.title} | Nuffread</title>
      </Head>

      <div className="container">
        <div className="flex">
          <div className="w-1/3 p-6">
            <div className="text-xl font-bold p-4">{listing.book.title}</div>
            <Listing listing={listing} />
          </div>
          <div className="w-1/3 p-6">
            <div className="text-xl font-bold p-4">Seller</div>
            <div className="my-4 p-4 rounded-lg shadow-lg">
              {listing.user?.name}
            </div>
          </div>
          <div className="w-1/3 p-6">
            <div className="text-xl font-bold p-4">From Other Sellers</div>

            {listing.book.listings.items.map(listing => (
              <Link href={`/p/${listing.id}`}>
                <a>
                  <div
                    className={`my-4 p-4 rounded-lg shadow-sm hover:shadow-lg ${
                      listingId === listing.id ? 'border-primary border' : ''
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
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withGraphQL(Post);
export const getServerSideProps = makeGetSSP(Post);

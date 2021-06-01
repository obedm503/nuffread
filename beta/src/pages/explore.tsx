import { gql } from '@apollo/client';
import Head from 'next/head';
import Link from 'next/link';
import { memo } from 'react';
import { makeGetSSP, withGraphQL } from '../apollo-client';
import { RelativeDate } from '../components/date';
import { Layout } from '../components/layout';
import { BASIC_LISTING } from '../queries';
import { IListing, ListingCondition } from '../schema.gql';
import { useQuery } from '../util/apollo';

const TOP_LISTINGS = gql`
  ${BASIC_LISTING}

  query TopListings {
    top(paginate: { limit: 20 }) {
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
`;

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
    <div className="flex-shrink-0 m-4 relative overflow-hidden rounded-lg w-40 shadow-sm hover:shadow-lg">
      <div className="relative bg-light">
        <img
          className="w-40"
          alt={`${listing.book.title} book cover`}
          src={listing.book.thumbnail}
        />
      </div>
      <div className="px-3 pb-3 mt-3">
        {/* <span className="block font-semibold text-sm">
          {listing.book.title}
        </span>

        {listing.book.subTitle ? (
          <span className="block text-sm">{listing.book.subTitle}</span>
        ) : null}

        <span className="block opacity-75 text-xs">
          {listing.book.authors.join(', ')}
        </span> */}

        <span className="block opacity-75 -mb-1 text-xs">
          <RelativeDate date={listing.createdAt} />
        </span>

        <div className="flex justify-between">
          <span className="block font-semibold text-xs">
            {listing.condition ? conditionNames[listing.condition] : ''}
          </span>

          <span className="bg-primary rounded-full text-white text-xs font-semibold px-3 py-2 leading-none flex items-center">
            ${(listing.price / 100).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
});

const Explore = function Explore() {
  const { loading, data, error } = useQuery(TOP_LISTINGS);

  if (error) {
    console.error(error);
    return (
      <Layout>
        <Head>
          <title>Explore | Nuffread</title>
        </Head>
        <Listings>Something went wrong</Listings>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Explore | Nuffread</title>
      </Head>

      <Listings>
        {data?.top.items.map(listing => (
          <Link key={listing.id} href={`/p/${listing.id}`}>
            <a>
              <Listing listing={listing} />
            </a>
          </Link>
        ))}
      </Listings>
    </Layout>
  );
};

export default withGraphQL(Explore);
export const getServerSideProps = makeGetSSP(Explore);

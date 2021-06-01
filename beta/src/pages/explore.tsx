import { gql } from '@apollo/client';
import Head from 'next/head';
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
    top(paginate: { limit: 12 }) {
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
    <div className="flex-shrink-0 m-10 relative overflow-hidden rounded-lg w-80 shadow-lg">
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
      <div className="relative bg-light" style={{ minHeight: '20rem' }}>
        <img
          className="w-80"
          alt={`${listing.book.title} book cover`}
          src={listing.book.thumbnail}
        />
      </div>
      <div className="px-3 pb-3 mt-3">
        <span className="block opacity-75 -mb-1 text-sm">
          <RelativeDate date={listing.createdAt} />
        </span>

        <div className="flex justify-between">
          <span className="block font-semibold text-lg">
            {listing.condition ? conditionNames[listing.condition] : ''}
          </span>

          <span className="bg-primary rounded-full text-white text-md font-semibold px-3 py-2 leading-none flex items-center">
            ${(listing.price / 100).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
});

const Explore = function Explore() {
  const { loading, data, error } = useQuery(TOP_LISTINGS);
  console.log(data?.top);
  return (
    <Layout>
      <Head>
        <title>Explore | Nuffread</title>
      </Head>

      <Listings>
        {data?.top.items.map(listing => (
          <Listing key={listing.id} listing={listing} />
        ))}
      </Listings>
    </Layout>
  );
};

export default withGraphQL(Explore);
export const getServerSideProps = makeGetSSP(Explore);

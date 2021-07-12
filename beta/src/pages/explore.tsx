import Head from 'next/head';
import Link from 'next/link';
import { memo } from 'react';
import { useQuery } from '../apollo/client';
import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { RelativeDate } from '../components/date';
import { Layout } from '../components/layout';
import {
  ITop_ListingsQuery,
  Top_ListingsDocument as TOP_LISTINGS,
} from '../queries';
import { useIsLoggedIn } from '../util/auth';
import { conditionNames } from '../util/index';

function Listings({ children }) {
  return (
    <div className="m-6 flex flex-wrap items-end justify-center">
      {children}
    </div>
  );
}

const Listing = memo<{
  listing: ITop_ListingsQuery['top']['items'][0];
}>(({ listing }) => {
  const isLoggedIn = useIsLoggedIn();
  return (
    <div className="flex-shrink-0 m-4 relative overflow-hidden rounded-lg w-40 shadow-sm hover:shadow-lg border-light border">
      <div className="relative bg-light">
        <img
          className="w-40"
          alt={`${listing.book.title} book cover`}
          src={listing.book.thumbnail || ''}
        />
      </div>
      {isLoggedIn ? (
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
      ) : null}
    </div>
  );
});

function Explore() {
  const res = useQuery(TOP_LISTINGS);

  if (res.loading) {
    return null;
  }

  if (res.error) {
    return (
      <Layout>
        <Head>
          <title>Explore - nuffread</title>
        </Head>
        <Listings>Something went wrong</Listings>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Explore - nuffread</title>
      </Head>

      <Listings>
        {res.data.top.items.map(listing => (
          <Link key={listing.id} href={`/b/${listing.book.id}`}>
            <a>
              <Listing listing={listing} />
            </a>
          </Link>
        ))}
      </Listings>
    </Layout>
  );
}

export default withApollo(Explore);
export const getServerSideProps = makeApolloSSR(Explore);

import { cart, cartOutline, syncOutline } from 'ionicons/icons';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { readQuery, useMutation, useQuery } from '../../apollo/client';
import { makeApolloSSR } from '../../apollo/ssr';
import { withApollo } from '../../apollo/with-apollo';
import { RelativeDate } from '../../components/date';
import { Icon } from '../../components/icon';
import { Layout } from '../../components/layout';
import {
  Get_BookDocument as GET_BOOK,
  Get_Saved_ListingsDocument as SAVED_LISTINGS,
  Save_ListingDocument as SAVE_LISTING,
} from '../../queries';
import { classes, conditionNames } from '../../util';
import { useIsLoggedIn } from '../../util/auth';

function SaveListingButton({ listingId, saved }) {
  const isLoggedIn = useIsLoggedIn();
  const [save, res] = useMutation(SAVE_LISTING, {
    variables: { listingId, saved: !saved },
  });
  const client = res.client;
  const cartIcon = saved ? cart : cartOutline;
  const icon = res.loading ? syncOutline : cartIcon;

  const onClick = useCallback(async () => {
    try {
      const res = await save();
      if (!res.data) {
        return;
      }
      const updatedListing = res.data.saveListing;
      if (updatedListing.saved) {
        // tracker.event('SAVE_POST', { listingId: updatedListing.id });
      } else {
        // tracker.event('UNSAVE_POST', { listingId: updatedListing.id });
      }

      const listingsData = readQuery(client, {
        query: SAVED_LISTINGS,
        variables: { offset: 0 },
      });

      if (
        !(listingsData?.me?.__typename === 'User') ||
        !listingsData?.me?.saved
      ) {
        return;
      }

      let totalCount = listingsData.me.saved.totalCount;
      let listings = listingsData.me.saved.items;
      if (updatedListing.saved) {
        listings = [updatedListing, ...listings];
        totalCount += 1;
      } else {
        listings = listings.filter(item => item.id !== updatedListing.id);
        totalCount -= 1;
      }

      client.writeQuery({
        query: SAVED_LISTINGS,
        data: {
          ...listingsData,
          me: {
            ...listingsData.me,
            saved: {
              ...listingsData.me.saved,
              totalCount,
              items: listings,
            },
          },
        },
        variables: { offset: 0 },
      });
    } catch {}
  }, [save, client]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={res.loading}
      className={classes(
        'outline-none focus:outline-none px-3 py-1 bg-white rounded-full flex items-center border border-black disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap float-right',
        { 'hover:bg-black hover:text-white': !res.loading },
      )}
      onClick={onClick}
    >
      <Icon
        icon={icon}
        className={classes('mr-2', { 'animate-spin': res.loading })}
      />{' '}
      {saved ? 'Remove from cart' : 'Save to cart'}
    </button>
  );
}

function Listings({ children }) {
  return (
    <div className="m-6 flex flex-wrap items-end justify-center">
      {children}
    </div>
  );
}

function BookPage() {
  const router = useRouter();
  const bookId = router?.query.id;

  const res = useQuery(GET_BOOK, {
    variables: { id: bookId },
  });
  if (res.loading) {
    return null;
  }

  if (res.error) {
    return (
      <Layout>
        <Head>
          <title>Nuffread</title>
        </Head>
        <Listings>Something went wrong</Listings>
      </Layout>
    );
  }

  const book = res.data.book!;

  return (
    <Layout title={book.title}>
      <Head>
        <title>{book.title} - nuffread</title>
      </Head>

      <div className="flex">
        <div className="w-1/2 m-6">
          <div className="w-80 ml-auto overflow-hidden rounded-lg shadow-lg">
            <img
              className="w-80"
              alt={`${book.title} book cover`}
              src={book.thumbnail ?? ''}
            />
          </div>
        </div>
        <div className="w-1/2 m-6">
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
                className={`relative border shadow-md my-4 p-4 rounded-lg hover:shadow-lg ${
                  bookId === listing.id ? 'border-primary border' : ''
                } border-light`}
              >
                <div className="flex justify-between">
                  <div>
                    <span className="block opacity-75 -mb-1 text-sm">
                      <RelativeDate date={listing.createdAt} />
                    </span>

                    <span className="block font-semibold text-lg">
                      {listing.condition
                        ? conditionNames[listing.condition]
                        : ''}
                    </span>
                  </div>

                  <div>
                    <span className="bg-primary rounded-full text-white text-md font-semibold px-3 py-2 leading-none flex items-center mt-auto">
                      ${(listing.price / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <p>{listing.description}</p>

                  <SaveListingButton
                    listingId={listing.id}
                    saved={listing.saved}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withApollo(BookPage);
export const getServerSideProps = makeApolloSSR(BookPage);

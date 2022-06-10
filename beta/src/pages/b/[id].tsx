import { chatbubblesOutline, syncOutline } from 'ionicons/icons';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { useMutation, useQuery } from '../../apollo/client';
import { makeApolloSSR } from '../../apollo/ssr';
import { withApollo } from '../../apollo/with-apollo';
import { RelativeDate } from '../../components/date';
import { Icon } from '../../components/icon';
import { Layout } from '../../components/layout';
import { SaveListingButton } from '../../components/save-listing-button';
import {
  Get_BookDocument as GET_BOOK,
  Start_ThreadDocument as START_THREAD,
} from '../../queries';
import { classes, conditionNames } from '../../util';
import { useMe } from '../../util/auth';

function GoToChat({
  listingId,
  sellerId,
}: {
  listingId: string;
  sellerId: string;
}) {
  const router = useRouter();
  const { me } = useMe();
  const [save, res] = useMutation(START_THREAD);

  const onClick = useCallback(async () => {
    const { data } = await save({ variables: { listingId } });

    const newThread = data?.startThread;
    if (!newThread) {
      return;
    }

    // tracker.event('START_THREAD', { listingId });
    router.push(`/chat/${newThread.id}`);
  }, [save, router, listingId]);

  if (!me) {
    return null;
  }
  if (sellerId === me.id) {
    return null;
  }

  return (
    <button
      type="button"
      disabled={res.loading}
      className={classes(
        'outline-none focus:outline-none px-3 py-1 bg-white rounded-full flex items-center border border-black disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
        { 'hover:bg-black hover:text-white': !res.loading },
      )}
      onClick={onClick}
    >
      <Icon
        icon={res.loading ? syncOutline : chatbubblesOutline}
        className={classes('mr-2', { 'animate-spin': res.loading })}
      />
      Text seller
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
  const bookId = router.query.id as string;

  const res = useQuery(GET_BOOK, { variables: { id: bookId } });
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
      <div className="md:flex md:max-w-4xl md:mx-auto">
        <div className="md:w-1/2 m-6">
          <div className="w-full mx-auto md:ml-auto overflow-hidden rounded-lg shadow-lg">
            <img
              className="w-full"
              alt={`${book.title} book cover`}
              src={book.thumbnail ?? ''}
            />
          </div>
        </div>
        <div className="md:w-1/2 m-6">
          <div className="rounded-lg shadow-lg p-4 bg-white">
            <span className="block font-semibold text-lg">{book.title}</span>

            {book.subTitle ? (
              <span className="block text-md">{book.subTitle}</span>
            ) : null}

            <span className="block opacity-75">{book.authors.join(', ')}</span>

            {book.isbn.length ? (
              <span className="block">
                <b>ISBN </b> {book.isbn.join(', ')}
              </span>
            ) : null}
            <span className="block">
              <b>Published </b>
              <RelativeDate date={book.publishedAt} />
            </span>
          </div>

          <div>
            <h2 className="font-semibold text-3xl mt-8 px-4 text-white">
              Listings
            </h2>
            <div className="max-h-96">
              {book.listings.items.map(listing => (
                <div
                  key={listing.id}
                  className={`relative my-4 p-4 bg-white rounded-lg shadow-lg hover:scale-105 transition duration-200 ease-in-out ${
                    bookId === listing.id ? 'border-primary border' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
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

                    {listing.user ? (
                      <GoToChat
                        listingId={listing.id}
                        sellerId={listing.user.id}
                      />
                    ) : null}
                  </div>

                  <div className="overflow-hidden">
                    <p className="py-3 px-2">{listing.description}</p>

                    <div className="flex justify-between">
                      <div>
                        <span className="bg-primary rounded-full text-white text-md font-semibold px-3 py-2 leading-none flex items-center mt-auto">
                          ${(listing.price / 100).toFixed(2)}
                        </span>
                      </div>

                      <SaveListingButton
                        listingId={listing.id}
                        saved={listing.saved}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default withApollo(BookPage);
export const getServerSideProps = makeApolloSSR(BookPage);

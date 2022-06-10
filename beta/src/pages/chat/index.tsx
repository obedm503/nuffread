import Link from 'next/link';
import { useQuery } from '../../apollo/client';
import { makeApolloSSR } from '../../apollo/ssr';
import { initializeApolloClient, withApollo } from '../../apollo/with-apollo';
import { Layout } from '../../components/layout';
import { Get_ThreadsDocument as GET_THREADS } from '../../queries';

function Chat() {
  const res = useQuery(GET_THREADS, {
    variables: { offset: 0 },
  });
  if (res.error || res.data?.me?.__typename === 'Admin') {
    return <Layout title="Chat">chat home</Layout>;
  }
  if (res.loading) {
    return <Layout title="Chat">chat home</Layout>;
  }

  return (
    <Layout title="Chat">
      <div className="mx-4 md:max-w-lg md:mx-auto my-4 space-y-4">
        {res.data.me?.threads.items.map((thread, i) => (
          <Link key={thread.id + i} href={`/chat/${thread.id}`}>
            <a className="flex items-center bg-white overflow-hidden rounded-lg shadow-lg hover:scale-105 transition duration-200 ease-in-out">
              <div>
                <img
                  src={thread.listing.book.thumbnail}
                  alt={thread.listing.book.title}
                  className="w-32"
                />
              </div>
              <div className="p-4">
                <h1 className="text-xl">
                  <b>{thread.listing.book.title}</b>
                </h1>
                <h2 className="text-lg">
                  {thread.listing.book.authors.join(', ')}
                </h2>
                <h2 className="text-lg">
                  Sold by <b>{thread.other.name || thread.other.email}</b>
                </h2>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
export default withApollo(Chat);
export const getServerSideProps = makeApolloSSR(Chat, async ctx => {
  const client = initializeApolloClient(ctx);

  try {
    const res = await client.query({
      query: GET_THREADS,
      variables: { offset: 0 },
    });

    if (res.data.me?.__typename === 'User') {
      const threads = res.data.me.threads;
      const lastThreadId = threads.items[0].id;
      return {
        redirect: { destination: `/chat/${lastThreadId}`, permanent: false },
      };
    }
  } catch (e) {
    console.error(e);
  }

  return { props: {} };
});

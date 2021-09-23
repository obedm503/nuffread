import { makeApolloSSR } from '../../apollo/ssr';
import { initializeApolloClient, withApollo } from '../../apollo/with-apollo';
import { Layout } from '../../components/layout';
import { Get_ThreadsDocument as GET_THREADS } from '../../queries';

function Chat() {
  return <Layout title="Chat">chat home</Layout>;
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

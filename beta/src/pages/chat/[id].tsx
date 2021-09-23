import { keyBy } from 'lodash';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useQuery } from '../../apollo/client';
import { makeApolloSSR } from '../../apollo/ssr';
import { withApollo } from '../../apollo/with-apollo';
import { Layout } from '../../components/layout';
import { Get_ThreadsDocument as GET_THREADS } from '../../queries';

function Chat() {
  const router = useRouter();
  const threadId = router.query.id as string;
  const res = useQuery(GET_THREADS, { variables: { offset: 0 } });

  const threads = useMemo(() => {
    if (!res.data || !res.data.me || res.data.me.__typename !== 'User') {
      return {};
    }
    return keyBy(res.data.me.threads.items, 'id');
  }, [res.data]);

  if (res.loading) {
    return null;
  }
  if (res.error || res.data.me?.__typename === 'Admin') {
    return <Layout title="Chat">Something went wrong</Layout>;
  }

  return (
    <Layout title="Chat">
      <div className="flex">
        <div className="w-1/3">
          {res.data.me?.threads.items.map(thread => (
            <div key={thread.id}>{thread.id}</div>
          ))}
        </div>
        <div className="w-2/3">
          {JSON.stringify(threads[threadId].messages.items, null, 2)}
        </div>
      </div>
    </Layout>
  );
}

export default withApollo(Chat);
export const getServerSideProps = makeApolloSSR(Chat);

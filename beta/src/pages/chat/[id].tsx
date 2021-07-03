import { useRouter } from 'next/router';
import { makeApolloSSR } from '../../apollo/ssr';
import { withApollo } from '../../apollo/with-apollo';
import { Layout } from '../../components/layout';

function Chat() {
  const router = useRouter();
  return <Layout>chat {router.query.id}</Layout>;
}

export default withApollo(Chat);
export const getServerSideProps = makeApolloSSR(Chat);

import { makeApolloSSR } from '../../apollo/ssr';
import { withApollo } from '../../apollo/with-apollo';
import { Layout } from '../../components/layout';

function Chat() {
  return <Layout>chat</Layout>;
}

export default withApollo(Chat);
export const getServerSideProps = makeApolloSSR(Chat);

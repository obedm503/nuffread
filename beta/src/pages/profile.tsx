import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Layout } from '../components/layout';
import { withToLogin } from '../util/auth';

const Schools = withToLogin(function Schools() {
  return <Layout>profile</Layout>;
});

export default withApollo(Schools);
export const getServerSideProps = makeApolloSSR(Schools);

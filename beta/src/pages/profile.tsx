import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Layout } from '../components/layout';

function Profile() {
  return <Layout>profile</Layout>;
}

export default withApollo(Profile);
export const getServerSideProps = makeApolloSSR(Profile);

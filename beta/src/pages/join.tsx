import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Layout } from '../components/layout';

function Join() {
  return (
    <Layout>
      <div>Join</div>
    </Layout>
  );
}

export default withApollo(Join);
export const getServerSideProps = makeApolloSSR(Join);

import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Layout } from '../components/layout';

function Reset() {
  return (
    <Layout>
      <div>Reset</div>
    </Layout>
  );
}

export default withApollo(Reset);
export const getServerSideProps = makeApolloSSR(Reset);

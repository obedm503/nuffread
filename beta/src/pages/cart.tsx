import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Layout } from '../components/layout';

function Cart() {
  return <Layout>cart</Layout>;
}

export default withApollo(Cart);
export const getServerSideProps = makeApolloSSR(Cart);

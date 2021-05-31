import { makeGetSSP, withGraphQL } from '../../apollo-client';
import { Layout } from '../../components/layout';

const Explore = function Explore() {
  return (
    <Layout>
      <div>explore</div>
    </Layout>
  );
};

export default withGraphQL(Explore);
export const getServerSideProps = makeGetSSP(Explore);

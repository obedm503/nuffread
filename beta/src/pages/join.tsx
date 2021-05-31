import { makeGetSSP, withGraphQL } from '../apollo-client';
import { Layout } from '../components/layout';

const Join = function Join() {
  return (
    <Layout>
      <div>Join</div>
    </Layout>
  );
};

export default withGraphQL(Join);
export const getServerSideProps = makeGetSSP(Join);

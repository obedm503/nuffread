import { makeGetSSP, withGraphQL } from '../apollo-client';
import { Layout } from '../components/layout';

const Reset = function Reset() {
  return (
    <Layout>
      <div>Reset</div>
    </Layout>
  );
};

export default withGraphQL(Reset);
export const getServerSideProps = makeGetSSP(Reset);

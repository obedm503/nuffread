import { makeGetSSP, withGraphQL } from '../apollo-client';
import { Layout } from '../components/layout';

const Search = function Search() {
  return (
    <Layout>
      <div>Search</div>
    </Layout>
  );
};

export default withGraphQL(Search);
export const getServerSideProps = makeGetSSP(Search);

import gql from 'graphql-tag';
import { withApollo } from '../apollo';
import { Layout } from '../components/layout';
import { Cols, Table } from '../components/table';
import { ISchool } from '../schema.gql';
import { useQuery } from '../util/apollo';
import { useToLogin } from '../util/auth';

const SCHOOLS = gql`
  query GetSchools {
    schools {
      id
      name
      domain
    }
  }
`;

const cols: Cols<ISchool> = [
  { name: 'Name', key: 'name' },
  { name: 'Domain', key: 'domain' },
];

export default withApollo()(function Schools() {
  useToLogin();

  const { data } = useQuery(SCHOOLS);

  return (
    <Layout>
      <Table title="Sessions" cols={cols} data={data?.schools} />
    </Layout>
  );
});

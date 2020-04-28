import gql from 'graphql-tag';
import { withApollo } from '../apollo';
import { Layout } from '../components/layout';
import { Cols, Table } from '../components/table';
import { IUser } from '../schema.gql';
import { useQuery } from '../util/apollo';
import { withToLogin } from '../util/auth';

const USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      confirmedAt
    }
  }
`;

const cols: Cols<IUser> = [
  { name: 'Name', key: 'name' },
  { name: 'Email', key: 'email' },
];

export default withApollo()(
  withToLogin(function Users() {
    const { data } = useQuery(USERS);

    return (
      <Layout>
        <Table title="Users" cols={cols} data={data?.users} />
      </Layout>
    );
  }),
);

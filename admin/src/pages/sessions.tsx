import gql from 'graphql-tag';
import { withApollo } from '../apollo';
import { Layout } from '../components/layout';
import { Cols, Table } from '../components/table';
import { ISession } from '../schema.gql';
import { useQuery } from '../util/apollo';
import { useToLogin } from '../util/auth';

const SESSIONS = gql`
  query GetSessions {
    sessions {
      id
      expiresAt
      user {
        ... on User {
          id
          name
          email
        }
        ... on Admin {
          id
          email
        }
      }
    }
  }
`;

const cols: Cols<ISession> = [
  { name: 'Name', key: s => (s.user.__typename === 'User' ? s.user.name : '') },
  { name: 'Email', key: s => s.user.email },
  { name: 'Expiration', key: 'expiresAt' },
];

export default withApollo()(function Sessions() {
  useToLogin();

  const { data } = useQuery(SESSIONS);

  return (
    <Layout>
      <Table title="Sessions" cols={cols} data={data?.sessions} />
    </Layout>
  );
});

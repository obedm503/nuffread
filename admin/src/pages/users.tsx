import gql from 'graphql-tag';
import { groupBy } from 'lodash';
import { withApollo } from '../apollo';
import { Card } from '../components/card';
import { RelativeDate } from '../components/date';
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
  { name: 'Confirmed At', key: u => <RelativeDate date={u.confirmedAt} /> },
];

export default withApollo()(
  withToLogin(function Users() {
    const { data } = useQuery(USERS);

    const users = data && data.users;
    const { confirmed, notConfirmed } = users
      ? groupBy(users, user =>
          user.confirmedAt ? 'confirmed' : 'notConfirmed',
        )
      : ({} as any);

    return (
      <Layout>
        <Card title="Not Confirmed Users">
          <Table cols={cols} data={notConfirmed} />
        </Card>

        <Card title="Confirmed Users">
          <Table cols={cols} data={confirmed} />
        </Card>
      </Layout>
    );
  }),
);

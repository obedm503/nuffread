import { gql } from '@apollo/client';
import groupBy from 'lodash/groupBy';
import { useQuery } from '../apollo/client';
import { makeApolloSSR } from '../apollo/ssr';
import { withApollo } from '../apollo/with-apollo';
import { Layout } from '../components/layout';
import { Cols } from '../components/table';
import { ISchool } from '../schema.gql';
import { withToLogin } from '../util/auth';

const SET_SCHOOL_NAME = gql`
  mutation SetSchoolName($id: ID!, $name: String!) {
    setSchoolName(id: $id, name: $name) {
      id
      name
      # updatedAt
    }
  }
`;

const SCHOOLS = gql`
  query GetSchools {
    schools {
      id
      # updatedAt
      name
      domain
    }
  }
`;

const cols: Cols<ISchool> = [
  { name: 'Domain', key: 'domain' },
  // { name: 'Last Updated', key: s => <RelativeDate date={s.updatedAt} /> },
];

const Schools = withToLogin(function Schools() {
  const { data } = useQuery(SCHOOLS);

  const schools = data && data.schools;
  const { noName, hasName } = schools
    ? groupBy(schools, school => (school.name ? 'hasName' : 'noName'))
    : ({} as any);

  return <Layout>profile</Layout>;
});

export default withApollo(Schools);
export const getServerSideProps = makeApolloSSR(Schools);

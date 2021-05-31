import { gql } from '@apollo/client';
import groupBy from 'lodash/groupBy';
import { useCallback } from 'react';
import { makeGetSSP, withGraphQL } from '../../apollo-client';
import { Card } from '../../components/card';
import { Layout } from '../../components/layout';
import { Cols, Table } from '../../components/table';
import { IMutationSetSchoolNameArgs, ISchool } from '../../schema.gql';
import { useMutation, useQuery } from '../../util/apollo';
import { withToLogin } from '../../util/auth';

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

export default withGraphQL(Schools);
export const getServerSideProps = makeGetSSP(Schools);

import gql from 'graphql-tag';
import groupBy from 'lodash/groupBy';
import { useCallback } from 'react';
import { Card } from '../components/card';
import { Layout } from '../components/layout';
import { Cols, Table } from '../components/table';
import { IMutationSetSchoolNameArgs, ISchool } from '../schema.gql';
import { useMutation, useQuery } from '../util/apollo';
import { withToLogin } from '../util/auth';
import { initializeApollo } from '../apollo';

const SET_SCHOOL_NAME = gql`
  mutation SetSchoolName($id: ID!, $name: String!) {
    setSchoolName(id: $id, name: $name) {
      id
      name
      # updatedAt
    }
  }
`;

function Name(school: ISchool) {
  const [setSchoolName, { loading, error }] = useMutation<
    IMutationSetSchoolNameArgs
  >(SET_SCHOOL_NAME);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!(e.target instanceof HTMLFormElement)) {
        return;
      }
      const values = new FormData(e.target);

      const name = values.get('name').toString();
      if (!name.length) {
        return;
      }

      if (name !== school.name) {
        await setSchoolName({ variables: { id: school.id, name } });
      }
    },
    [school.id, school.name, setSchoolName],
  );

  if (error) {
    console.error(error);
    return null;
  }

  return (
    <form onSubmit={onSubmit} key={school.id} className="w-1/2">
      <div className="relative flex w-full flex-wrap items-stretch border-2 rounded border-light">
        <input
          readOnly={loading}
          type="text"
          name="name"
          defaultValue={school.name}
          className="px-3 py-3 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline w-full"
          maxLength={255}
        />
      </div>
    </form>
  );
}

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
  { name: 'Name', key: Name },
  // { name: 'Last Updated', key: s => <RelativeDate date={s.updatedAt} /> },
];

export default withToLogin(function Schools() {
  const { data } = useQuery(SCHOOLS);

  const schools = data && data.schools;
  const { noName, hasName } = schools
    ? groupBy(schools, school => (school.name ? 'hasName' : 'noName'))
    : ({} as any);

  return (
    <Layout>
      <Card title="New Schools">
        <Table cols={cols} data={noName} />
      </Card>

      <Card title="Schools">
        <Table cols={cols} data={hasName} />
      </Card>
    </Layout>
  );
});

export const getInitialProps = async ctx => {
  const apolloClient = initializeApollo(null);

  await apolloClient.query({
    query: SCHOOLS,
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
    unstable_revalidate: 1,
  };
};

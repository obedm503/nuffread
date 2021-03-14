import gql from 'graphql-tag';
import { useCallback, useState } from 'react';
import { Card } from '../components/card';
import { Layout } from '../components/layout';
import { Cols, Table } from '../components/table';
import {
  FeatureLevel,
  IFeature,
  IMutationCreateFeatureArgs,
} from '../schema.gql';
import { useMutation, useQuery } from '../util/apollo';
import { withToLogin } from '../util/auth';

function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
// const UPDATE_FEATURE = gql`
//   mutation UpdateFeature($id: ID!, $type: UserRelationshipType!) {
//     updateFeature(id: $id, type: $type) {
//       id
//       type
//       # updatedAt
//     }
//   }
// `;

// function Name(feature: IFeature) {
//   const [setSchoolName, { loading, error }] = useMutation<
//     IMutationSetSchoolNameArgs
//   >(UPDATE_FEATURE);

//   const onSubmit = useCallback(
//     async (e: React.FormEvent<HTMLFormElement>) => {
//       e.preventDefault();
//       if (!(e.target instanceof HTMLFormElement)) {
//         return;
//       }
//       const values = new FormData(e.target);

//       const name = values.get('name').toString();
//       if (!name.length) {
//         return;
//       }

//       if (name !== feature.name) {
//         await setSchoolName({ variables: { id: feature.id, name } });
//       }
//     },
//     [feature.id, feature.name, setSchoolName],
//   );

//   if (error) {
//     console.error(error);
//     return null;
//   }

//   return (
//     <form onSubmit={onSubmit} key={feature.id} className="w-1/2">
//       <div className="relative flex w-full flex-wrap items-stretch border-2 rounded border-light">
//         <input
//           readOnly={loading}
//           type="text"
//           name="name"
//           defaultValue={feature.name}
//           className="px-3 py-3 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline w-full"
//           maxLength={255}
//         />
//       </div>
//     </form>
//   );
// }

const FEATURES = gql`
  query GetFeatures {
    features {
      id
      name
      level
    }
  }
`;

const cols: Cols<IFeature> = [
  { name: 'ID', key: 'id' },
  { name: 'Level', key: 'level' },
  { name: 'Name', key: 'name' },
  // { name: 'Last Updated', key: s => <RelativeDate date={s.updatedAt} /> },
];

const CREATE_FEATURE = gql`
  mutation CreateFeature($name: String!, $level: FeatureLevel!) {
    createFeature(name: $name, level: $level) {
      id
      name
      level
    }
  }
`;

function CreateFeature() {
  const [createFeature, { loading, error }] = useMutation<
    IMutationCreateFeatureArgs
  >(CREATE_FEATURE);
  const [state, setState] = useState<{ name: string; level: FeatureLevel }>({
    name: '',
    level: FeatureLevel.None,
  });

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

      const level = values.get('level').toString() as FeatureLevel;
      if (!level.length || !hasOwn(FeatureLevel, level)) {
        return;
      }

      await createFeature({ variables: { name, level } });
    },
    [createFeature],
  );

  if (error) {
    console.error(error);
    return null;
  }

  return (
    <form onSubmit={onSubmit} className="w-1/2">
      <div className="relative flex w-full flex-wrap items-stretch border-2 rounded border-light">
        <input
          readOnly={loading}
          type="text"
          name="name"
          defaultValue={state.name}
          className="px-3 py-3 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline w-full"
          maxLength={255}
        />
      </div>
      <div className="relative flex w-full flex-wrap items-stretch border-2 rounded border-light">
        <input
          readOnly={loading}
          type="text"
          name="level"
          defaultValue={state.level}
          className="px-3 py-3 placeholder-gray-400 text-gray-700 relative bg-white bg-white rounded text-sm shadow outline-none focus:outline-none focus:shadow-outline w-full"
          maxLength={255}
        />
      </div>
      <input type="submit" name="Submit" />
    </form>
  );
}

export default withToLogin(function Features() {
  const { data } = useQuery(FEATURES);
  const features = data && data.features;

  return (
    <Layout>
      <Card title="New Feature">
        <CreateFeature />
      </Card>
      <Card title="Features">
        <Table cols={cols} data={features} />
      </Card>
    </Layout>
  );
});

import {
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonSpinner,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import { create, save } from 'ionicons/icons';
import groupBy from 'lodash/groupBy';
import React, { memo, useCallback, useState } from 'react';
import { object, string } from 'yup';
import { Container, Error, Loading, Text } from '../../components';
import { IMutationSetSchoolNameArgs, ISchool } from '../../schema.gql';
import { useMutation, useQuery } from '../../state/apollo';

const SCHOOLS = gql`
  query GetSchools {
    schools {
      id
      name
      domain
    }
  }
`;
const SET_SCHOOL_NAME = gql`
  mutation SetSchoolName($id: ID!, $name: String!) {
    setSchoolName(id: $id, name: $name) {
      id
      name
    }
  }
`;

const schema = object().shape({
  name: string().required('Name is required'),
});
const School = memo<{ school: ISchool }>(({ school }) => {
  const [editing, setEditing] = useState(false);
  const onClick = useCallback(() => setEditing(true), []);

  const [setSchoolName, { loading, error }] = useMutation<
    IMutationSetSchoolNameArgs
  >(SET_SCHOOL_NAME);

  const onSubmit = useCallback(
    async ({ name }) => {
      if (!name.length) {
        return;
      }
      if (name !== school.name) {
        await setSchoolName({ variables: { id: school.id, name } });
      }
      setEditing(() => false);
    },
    [school.id, school.name, setSchoolName],
  );

  if (error) {
    return <Error value={error} />;
  }

  if (editing) {
    return (
      <Formik
        onSubmit={onSubmit}
        validationSchema={schema}
        initialValues={{ name: school.name }}
      >
        {({ handleSubmit }) => (
          <Form>
            <Text
              name="name"
              label={`Name: ${school.domain}`}
              placeholder={school.name}
              disabled={loading}
            >
              <IonButton
                slot="end"
                disabled={loading}
                onClick={() => handleSubmit()}
                fill="outline"
                color="success"
              >
                {loading ? (
                  <IonSpinner slot="icon-only" />
                ) : (
                  <IonIcon slot="icon-only" icon={save} />
                )}
              </IonButton>
            </Text>
          </Form>
        )}
      </Formik>
    );
  }

  return (
    <IonItem lines="full">
      <IonLabel>
        <b>{school.name}</b> {school.domain}
      </IonLabel>
      <IonButton slot="end" onClick={onClick} fill="outline">
        <IonIcon slot="icon-only" icon={create} />
      </IonButton>
    </IonItem>
  );
});
const Schools: React.FC<{
  title: string;
  schools?: ISchool[];
}> = ({ title, schools = [] }) => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{title}</IonCardTitle>
      </IonCardHeader>

      {!schools.length ? (
        <IonItem>
          <IonLabel>No items</IonLabel>
        </IonItem>
      ) : (
        schools.map(school => <School key={school.id} school={school} />)
      )}
    </IonCard>
  );
};
const Page = ({ children }) => (
  <IonPage>
    <IonContent>
      <Container>{children}</Container>
    </IonContent>
  </IonPage>
);

export default () => {
  const { loading, error, data } = useQuery(SCHOOLS, { pollInterval: 60000 });

  if (loading) {
    return (
      <Page>
        <Loading />
      </Page>
    );
  }
  if (error) {
    return <Error value={error} />;
  }
  const schools = data!.schools;
  const { noName, hasName } = groupBy(schools, school =>
    school.name ? 'hasName' : 'noName',
  );

  return (
    <Page>
      <Schools title="New Schools" schools={noName} />

      <Schools title="Schools" schools={hasName} />
    </Page>
  );
};

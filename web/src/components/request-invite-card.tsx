import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonGrid,
  IonLabel,
  IonList,
  IonRow,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import React from 'react';
import { Link } from 'react-router-dom';
import { object, string } from 'yup';
import { IMutationRequestInviteArgs } from '../schema.gql';
import { useMutation } from '../state/apollo';
import { tracker } from '../state/tracker';
import { studentEmailSchema } from '../util';
import { apolloFormErrors } from './apollo-error';
import { Email } from './controls/email';
import { Text } from './controls/text';
import { IonSubmit } from './ionic';

const REQUEST_INVITE = gql`
  mutation RequestInvite($email: String!, $name: String!) {
    requestInvite(email: $email, name: $name)
  }
`;

type FormSchema = { email: string; name: string };
const schema = object<FormSchema>().shape({
  name: string().required('Name is required'),
  email: studentEmailSchema,
});

const Errors = apolloFormErrors({
  DUPLICATE_INVITE: (
    <>
      This email is already registered <Link to="/login">login</Link> instead
    </>
  ),
});

const RequestInviteForm = React.memo(function RequestInvite() {
  const [mutate, { error, data, loading }] = useMutation<
    IMutationRequestInviteArgs
  >(REQUEST_INVITE);

  const onSubmit = React.useCallback(
    async ({ email, name }: { email: string; name: string }) => {
      await mutate({ variables: { email, name } });
      tracker.invite({ email });
    },
    [mutate],
  );

  if (data?.requestInvite) {
    return (
      <p>We got your request. We will send you an email when it's approved.</p>
    );
  }

  return (
    <Formik<FormSchema>
      onSubmit={onSubmit}
      validationSchema={schema}
      initialValues={{
        email: '',
        name: '',
      }}
    >
      <Form>
        <IonList>
          <Text name="name" label="Name" disabled={loading} />
          <Email name="email" label="Email" disabled={loading} />

          <Errors error={error} />
        </IonList>

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonSubmit expand="block" disabled={loading}>
                <IonLabel>Get your invite</IonLabel>
              </IonSubmit>
            </IonCol>
          </IonRow>
        </IonGrid>
      </Form>
    </Formik>
  );
});
export const RequestInvite = () => (
  <IonCard color="white">
    <IonCardHeader>
      <IonCardTitle>Get early access</IonCardTitle>
    </IonCardHeader>

    <IonCardContent>
      <RequestInviteForm />
    </IonCardContent>
  </IonCard>
);

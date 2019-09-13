import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonList,
  IonRow,
  IonText,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import * as React from 'react';
import { useMutation } from 'react-apollo';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import * as yup from 'yup';
import { Email, IonButtonLink, Text, TopNav } from '../../components';
import { IMutation } from '../../schema.gql';
import { useRouter } from '../../state/router';

const REQUEST_INVITE = gql`
  mutation RequestInvite($email: String!, $name: String!) {
    requestInvite(email: $email, name: $name)
  }
`;

type FormSchema = { email: string; name: string };
const schema = yup.object<FormSchema>().shape({
  email: yup
    .string()
    .required('Email is required')
    .email('Must be a valid email')
    .test(
      'edu',
      'Must be a student email',
      value => !!value && value.endsWith('.edu'),
    ),
  name: yup.string().required('Name is required'),
});

const RequestInvite: React.FC = () => {
  const [mutate, { error, data }] = useMutation<IMutation>(REQUEST_INVITE);

  const duplicateInviteError =
    error &&
    error.graphQLErrors.find(err => err.message === 'DUPLICATE_INVITE');

  if (data && data.requestInvite) {
    return <p>We got your request. If approved, we will send you an email.</p>;
  }

  const onSubmit = ({ email, name }) => mutate({ variables: { email, name } });
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
        <IonList lines="full">
          <Text name="name" label="Name" />
          <Email name="email" label="Email" />
        </IonList>

        {duplicateInviteError ? (
          <p className="help is-danger">
            This email is already registered. <Link to="/login">Login?</Link>
          </p>
        ) : null}

        <div className="ion-padding">
          <input
            type="submit"
            style={{
              position: 'absolute',
              left: '-9999px',
              width: '1px',
              height: '1px',
            }}
            tabIndex={-1}
          />
          <IonButton expand="block" type="submit">
            Request your invite
          </IonButton>
        </div>
      </Form>
    </Formik>
  );
};

export default () => {
  const { location } = useRouter();
  if (location.pathname !== '/') {
    return <Redirect to="/" />;
  }

  return (
    <>
      <TopNav>
        <IonButtons slot="end">
          <IonButtonLink href="/login">Login</IonButtonLink>
        </IonButtons>
      </TopNav>

      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="10" offset="1" sizeMd="4">
              <h1>
                <IonText color="primary">nuffread</IonText> is
              </h1>

              <IonList lines="inset">
                <IonItem>Open book marketplace</IonItem>
                <IonItem>Transparent</IonItem>
                <IonItem>Closed alpha stage</IonItem>
              </IonList>
            </IonCol>

            <IonCol size="10" offset="1" sizeMd="4" offsetMd="2">
              <h1>Request early access</h1>

              <RequestInvite></RequestInvite>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </>
  );
};

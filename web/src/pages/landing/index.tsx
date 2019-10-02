import { useMutation } from '@apollo/react-hooks';
import {
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonText,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { object, string } from 'yup';
import {
  Email,
  IonButtonLink,
  IonSubmit,
  Text,
  TopNav,
} from '../../components';
import { IMutation } from '../../schema.gql';
import { studentEmailSchema } from '../../util';

const REQUEST_INVITE = gql`
  mutation RequestInvite($email: String!, $name: String!) {
    requestInvite(email: $email, name: $name)
  }
`;

type FormSchema = { email: string; name: string };
const schema = object<FormSchema>().shape({
  email: studentEmailSchema,
  name: string().required('Name is required'),
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
          <IonSubmit expand="block">Request your invite</IonSubmit>
        </div>
      </Form>
    </Formik>
  );
};

export default () => {
  return (
    <IonPage>
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
    </IonPage>
  );
};

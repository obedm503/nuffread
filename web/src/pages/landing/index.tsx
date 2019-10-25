import { useMutation } from '@apollo/react-hooks';
import {
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonItem,
  IonLabel,
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
import { apolloFormErrors } from '../../components/apollo-error';
import { IMutation } from '../../schema.gql';
import { tracker } from '../../state/tracker';
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

const Errors = apolloFormErrors({
  DUPLICATE_INVITE: (
    <>
      This email is already registered. <Link to="/login">Login?</Link>
    </>
  ),
});

const RequestInvite: React.FC = () => {
  const [mutate, { error, data, loading }] = useMutation<IMutation>(
    REQUEST_INVITE,
  );

  if (data && data.requestInvite) {
    return <p>We got your request. If approved, we will send you an email.</p>;
  }

  const onSubmit = async ({ email, name }) => {
    await mutate({ variables: { email, name } });
    tracker.invite(email);
  };
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

          <Errors error={error}></Errors>
        </IonList>

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonSubmit expand="block" disabled={loading}>
                <IonLabel>Request your invite</IonLabel>
              </IonSubmit>
            </IonCol>
          </IonRow>
        </IonGrid>
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

            <IonCol size="12" sizeMd="5" offsetMd="1" sizeLg="4" offsetLg="2">
              <IonCard color="white">
                <IonCardHeader>
                  <IonCardTitle>Request early access</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <RequestInvite />
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

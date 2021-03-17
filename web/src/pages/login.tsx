import { gql, useApolloClient } from '@apollo/client';
import {
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonLabel,
  IonList,
  IonPage,
  IonRow,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import { logInOutline } from 'ionicons/icons';
import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { object } from 'yup';
import {
  apolloFormErrors,
  Container,
  Email,
  IonSubmit,
  Password,
  TopNav,
} from '../components';
import { IMutationLoginArgs, SystemUserType } from '../schema.gql';
import { tracker, useMutation, useUser } from '../state';
import { emailSchema, passwordSchema } from '../util';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!, $type: SystemUserType!) {
    login(email: $email, password: $password, type: $type) {
      ... on User {
        id
        email
      }
    }
  }
`;

const Errors = apolloFormErrors({
  NOT_CONFIRMED:
    'Email is not yet confirmed. Click the link on the email we sent you to confirm it.',
  WRONG_CREDENTIALS: 'Wrong email or passphrase.',
});

const LoginForm = React.memo<{
  type: SystemUserType;
  schema;
}>(({ schema, type }) => {
  const [mutate, { loading, error }] = useMutation<IMutationLoginArgs>(LOGIN);
  const client = useApolloClient();

  const onSubmit = React.useCallback(
    async ({ email, password }) => {
      const res = await mutate({
        variables: { email, password, type },
      });
      if (res?.data?.login) {
        tracker.login({ email: res.data.login.email });
        await client.resetStore();
      }
    },
    [client, mutate, type],
  );

  return (
    <Formik<{ email: string; password: string }>
      onSubmit={onSubmit}
      validationSchema={schema}
      initialValues={{ email: '', password: '' }}
    >
      <Form>
        <IonList>
          <Email name="email" label="Email" disabled={loading} />
          <Password name="password" label="Passphrase" disabled={loading} />

          <Errors error={error} />
        </IonList>

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonSubmit expand="block" disabled={loading}>
                <IonLabel>Login</IonLabel>
                <IonIcon slot="end" icon={logInOutline} />
              </IonSubmit>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol className="ion-text-center">
              <Link to="/reset">Forgot passphrase?</Link>
            </IonCol>
          </IonRow>
        </IonGrid>
      </Form>
    </Formik>
  );
});

const userSchema = object().shape({
  email: emailSchema,
  password: passwordSchema,
});

export const UserLogin = React.memo<RouteComponentProps<{}>>(
  function UserLogin() {
    const user = useUser();
    if (user) {
      return <Redirect to="/" />;
    }
    return (
      <IonPage>
        <TopNav homeHref="/">
          <IonButtons slot="start">
            <IonBackButton />
          </IonButtons>
        </TopNav>

        <IonContent>
          <Container>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle className="ion-text-center">Login</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <LoginForm type={SystemUserType.User} schema={userSchema} />
              </IonCardContent>
            </IonCard>
          </Container>
        </IonContent>
      </IonPage>
    );
  },
);

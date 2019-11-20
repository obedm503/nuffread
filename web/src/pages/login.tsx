import { useApolloClient } from '@apollo/react-hooks';
import {
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
  IonRow,
} from '@ionic/react';
import { Form, Formik } from 'formik';
import gql from 'graphql-tag';
import { History } from 'history';
import { logIn } from 'ionicons/icons';
import * as React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { object } from 'yup';
import { Email, IonSubmit, Password, TopNav } from '../components';
import { apolloFormErrors } from '../components/apollo-error';
import { Container } from '../components/container';
import { IMutationLoginArgs, SystemUserType } from '../schema.gql';
import { useMutation } from '../state/apollo';
import { tracker } from '../state/tracker';
import { useUser } from '../state/user';
import { emailSchema, passwordSchema } from '../util';

const LOGIN = gql`
  mutation Login($email: String!, $password: String!, $type: SystemUserType!) {
    login(email: $email, password: $password, type: $type) {
      ... on User {
        id
        email
      }
      ... on Admin {
        id
        email
      }
    }
  }
`;

const Errors = apolloFormErrors({
  DUPLICATE_USER: 'Email is already registered.',
  NOT_CONFIRMED: (
    <>
      Email is not yet confirmed. To confirm your email{' '}
      <Link to="/join">click here</Link>.
    </>
  ),
  WRONG_CREDENTIALS: 'Wrong email or passphrase.',
});

const LoginForm = React.memo<{
  type: SystemUserType;
  history: History;
  schema;
}>(({ schema, type, history }) => {
  const [mutate, { loading, error }] = useMutation<IMutationLoginArgs>(LOGIN);
  const client = useApolloClient();

  const onSubmit = React.useCallback(
    async ({ email, password }) => {
      const res = await mutate({
        variables: { email, password, type },
      });
      if (res && res.data && res.data.login) {
        await client.resetStore();
        tracker.login({ email: res.data.login.email });
        history.push('/');
      }
    },
    [client, history, mutate, type],
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
                <IonIcon slot="start" icon={logIn} />
                <IonLabel>Login</IonLabel>
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

const adminSchema = object().shape({
  email: emailSchema,
  password: passwordSchema,
});
const userSchema = object().shape({
  email: emailSchema,
  password: passwordSchema,
});

export const UserLogin = React.memo<
  RouteComponentProps<{}> & { admin?: boolean }
>(function UserLogin({ history, admin = false }) {
  const user = useUser();
  if (user) {
    return <Redirect to="/" />;
  }
  return (
    <>
      <TopNav homeHref="/" />

      <IonContent>
        <Container>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle className="ion-text-center">Login</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <LoginForm
                history={history}
                type={admin ? SystemUserType.Admin : SystemUserType.User}
                schema={admin ? adminSchema : userSchema}
              />
            </IonCardContent>
          </IonCard>
        </Container>
      </IonContent>
    </>
  );
});

export class AdminLogin extends React.PureComponent<RouteComponentProps<{}>> {
  render() {
    return <UserLogin {...this.props} admin />;
  }
}
